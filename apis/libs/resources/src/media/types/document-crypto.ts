import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { ServiceUnavailableException } from '@nestjs/common';
const magic = Buffer.from('CABDOC1');
function key(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value))
    throw new ServiceUnavailableException(
      'Private document storage requires DOCUMENT_ENCRYPTION_KEY',
    );
  return Buffer.from(value, 'hex');
}
export function encryptDocument(data: Buffer, secret: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([magic, iv, cipher.getAuthTag(), encrypted]);
}
export function decryptDocument(data: Buffer, secret: string) {
  if (data.length < 35 || !data.subarray(0, 7).equals(magic))
    throw new Error('Document is not encrypted');
  const cipher = createDecipheriv(
    'aes-256-gcm',
    key(secret),
    data.subarray(7, 19),
  );
  cipher.setAuthTag(data.subarray(19, 35));
  return Buffer.concat([cipher.update(data.subarray(35)), cipher.final()]);
}
