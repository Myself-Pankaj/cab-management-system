/** Run after migration 020 and before deploying document UI. Defaults to dry-run. */
const { Client } = require('pg');
const ImageKit = require('imagekit');
const { createCipheriv, randomBytes } = require('node:crypto');
const { loadEnvFile, getPgClientConfig } = require('./load-env.cjs');
loadEnvFile();
const apply = process.argv.includes('--apply');
(async () => {
  const db = new Client(getPgClientConfig());
  await db.connect();
  try {
    const rows = (
      await db.query(
        `SELECT i.*, d.document_type::text driver_document_type,COALESCE(d.driver_profile_id,v.driver_profile_id) profile_id FROM images i LEFT JOIN driver_documents d ON i.owner_type='DRIVER_DOCUMENT' AND d.id=i.owner_id LEFT JOIN vehicle_documents vd ON i.owner_type='VEHICLE_DOCUMENT' AND vd.id=i.owner_id LEFT JOIN vehicles v ON v.id=vd.vehicle_id WHERE i.owner_type IN ('DRIVER_DOCUMENT','VEHICLE_DOCUMENT') AND NOT i.document_private`,
      )
    ).rows;
    console.log(
      `${rows.length} document images need privacy verification. ${apply ? 'Applying.' : 'Dry-run; use --apply to migrate.'}`,
    );
    if (!apply) return;
    if (!/^[a-f0-9]{64}$/i.test(process.env.DOCUMENT_ENCRYPTION_KEY || ''))
      throw new Error('Document encryption key required');
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY)
      throw new Error('ImageKit credentials are required');
    const provider = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
    for (const row of rows) {
      let valid = false,
        replacement;
      try {
        const file = await provider.updateFileDetails(row.imagekit_file_id, {
          isPrivateFile: true,
        });
        if (!file.isPrivateFile)
          throw new Error('Provider did not confirm private access');
        // Privatize and purge the legacy source before exposing any replacement.
        const purge = await provider.purgeCache(row.url);
        let purged = false;
        for (let attempt = 0; attempt < 20; attempt++) {
          const state = await provider.getPurgeCacheStatus(purge.requestId);
          if (state.status === 'Completed') {
            purged = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!purged) throw new Error('Cache purge is not confirmed');
        const verified = await provider.getFileDetails(row.imagekit_file_id);
        const mime = verified.mime || '';
        valid =
          verified.isPrivateFile &&
          verified.size <= 10 * 1024 * 1024 &&
          ['image/jpeg', 'image/png', 'image/webp'].includes(mime) &&
          row.driver_document_type !== 'AADHAAR';
        if (valid) {
          const signed = provider.url({
            path: verified.filePath,
            signed: true,
            expireSeconds: 60,
          });
          const response = await fetch(signed, {
            signal: AbortSignal.timeout(15000),
            redirect: 'error',
          });
          if (!response.ok) throw new Error('Legacy download failed');
          const data = Buffer.from(await response.arrayBuffer());
          if (data.length > 10 * 1024 * 1024)
            throw new Error('Legacy document too large');
          const iv = randomBytes(12),
            cipher = createCipheriv(
              'aes-256-gcm',
              Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY, 'hex'),
              iv,
            );
          const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final(),
          ]);
          const payload = Buffer.concat([
            Buffer.from('CABDOC1'),
            iv,
            cipher.getAuthTag(),
            encrypted,
          ]);
          replacement = await provider.upload({
            file: payload,
            fileName: 'document.bin',
            folder: `/driver-documents/${row.owner_id}`,
            isPrivateFile: true,
            useUniqueFileName: true,
          });
          if (!replacement.isPrivateFile)
            throw new Error('Private replacement not confirmed');
        }
      } catch {
        valid = false;
        console.error(
          `Image ${row.id}: privacy verification failed; quarantined for resubmission.`,
        );
      }
      await db.query('BEGIN');
      try {
        await db.query(
          'SELECT id FROM driver_profiles WHERE id=$1 FOR UPDATE',
          [row.profile_id],
        );
        if (valid && replacement)
          await db.query(
            'UPDATE images SET document_private=TRUE,imagekit_file_id=$2,url=$3 WHERE id=$1',
            [row.id, replacement.fileId, replacement.filePath],
          );
        else {
          const reason =
            row.driver_document_type === 'AADHAAR'
              ? 'Upload a masked Aadhaar copy if you wish to provide Aadhaar'
              : 'Private document image unavailable; please resubmit';
          // Fixed allowlist; no caller-supplied SQL identifiers.
          if (row.owner_type === 'DRIVER_DOCUMENT')
            await db.query(
              "UPDATE driver_documents SET status='REJECTED',rejection_reason=$2 WHERE id=$1",
              [row.owner_id, reason],
            );
          else
            await db.query(
              "UPDATE vehicle_documents SET status='REJECTED',rejection_reason=$2 WHERE id=$1",
              [row.owner_id, reason],
            );
          if (row.driver_document_type !== 'AADHAAR')
            await db.query(
              "UPDATE driver_profiles SET status='REJECTED' WHERE id=$1 AND status IN ('APPROVED','PENDING_VERIFICATION')",
              [row.profile_id],
            );
        }
        await db.query('COMMIT');
        // Plain legacy objects must not survive as alternate named-transformation URLs.
        if (valid && replacement)
          await provider.deleteFile(row.imagekit_file_id);
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    }
    console.log(
      'Document privacy migration finished. Review quarantined applications before enabling assignments.',
    );
  } finally {
    await db.end();
  }
})().catch(() => {
  console.error(
    'Document privacy migration failed. Check provider and database access; no private URLs or credentials are logged.',
  );
  process.exitCode = 1;
});
