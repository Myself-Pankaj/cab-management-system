import { DriverRideService } from '../../libs/resources/src/rides/services/driver-ride.service.js';
import { RideRepository } from '../../libs/resources/src/rides/repositories/ride.repository.js';
import { PaymentRepository } from '../../libs/resources/src/rides/repositories/payment.repository.js';
import { RideStatusHistoryRepository } from '../../libs/resources/src/rides/repositories/ride-status-history.repository.js';
import { RideStatusService } from '../../libs/resources/src/rides/services/ride-status.service.js';
import { PaymentSummaryService } from '../../libs/resources/src/rides/services/payment-summary.service.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { DriverOnboardingService } from '../../libs/resources/src/drivers/services/driver-onboarding.service.js';
import { AdminDriverService } from '../../libs/resources/src/drivers/services/admin-driver.service.js';
import { UserRepository } from '../../libs/resources/src/auth/repositories/user.repository.js';
import { DriverProfileRepository } from '../../libs/resources/src/drivers/repositories/driver-profile.repository.js';
import { DriverDocumentRepository } from '../../libs/resources/src/drivers/repositories/driver-document.repository.js';
import { DriverBankAccountRepository } from '../../libs/resources/src/drivers/repositories/driver-bank-account.repository.js';
import { VehicleRepository } from '../../libs/resources/src/drivers/repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../../libs/resources/src/drivers/repositories/vehicle-document.repository.js';
import { DriverVerificationRepository } from '../../libs/resources/src/drivers/repositories/driver-verification.repository.js';
import { ImageRepository } from '../../libs/resources/src/media/repositories/image.repository.js';
import { MediaCleanupRepository } from '../../libs/resources/src/media/repositories/media-cleanup.repository.js';
import { MediaCleanupService } from '../../libs/resources/src/media/services/media-cleanup.service.js';
import { MediaService } from '../../libs/resources/src/media/services/media.service.js';
import { DriverRideRepository } from '../../libs/resources/src/rides/repositories/driver-ride.repository.js';
const connectionString = process.env.ONBOARDING_TEST_DATABASE_URL;
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR5sAAAAASUVORK5CYII=',
  'base64',
);
function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
describe.skipIf(!connectionString)(
  'Onboarding with isolated PostgreSQL',
  () => {
    const pool = new Pool({ connectionString, max: 8 });
    const db = {
      getPool: () => pool,
      withTransaction: async <T>(work: (client: PoolClient) => Promise<T>) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await work(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      },
    };
    const users = new UserRepository(db as never);
    const profiles = new DriverProfileRepository(db as never);
    const docs = new DriverDocumentRepository(db as never);
    const banks = new DriverBankAccountRepository(db as never);
    const vehicles = new VehicleRepository(db as never);
    const vehicleDocs = new VehicleDocumentRepository(db as never);
    const reviews = new DriverVerificationRepository(db as never);
    const images = new ImageRepository(db as never);
    const jobs = new MediaCleanupRepository(db as never);
    const operations = new DriverRideRepository(db as never);
    const onboarding = new DriverOnboardingService(
      users,
      profiles,
      docs,
      banks,
      vehicles,
      vehicleDocs,
      reviews,
      images,
      db as never,
    );
    const admin = new AdminDriverService(
      users,
      profiles,
      docs,
      banks,
      vehicles,
      vehicleDocs,
      reviews,
      images,
      db as never,
      onboarding,
    );
    const logger = { errorWithMetadata: vi.fn() };
    let adminId: string;
    async function user(role: string) {
      const result = await pool.query<{ id: string }>(
        'INSERT INTO users(full_name,global_role,email) VALUES($1,$2,$3) RETURNING id',
        ['Onboarding test', role, `${randomUUID()}@example.test`],
      );
      return result.rows[0].id;
    }
    async function draft(complete = true) {
      const userId = await user('Driver');
      const profile = await profiles.create({ userId, status: 'DRAFT' });
      if (!complete) return { userId, profile, vehicleId: '', licenceId: '' };
      const { vehicle } = await onboarding.addVehicle(userId, {
        vehicle_number: randomUUID().slice(0, 20),
        vehicle_type: 'SEATER_4',
      });
      const licence = await docs.create({
        driverProfileId: profile.id,
        documentType: 'DRIVING_LICENCE',
        documentNumber: 'OLD',
        expiryDate: '2027-01-01',
        status: 'PENDING',
      });
      const owners: {
        type: 'VEHICLE' | 'DRIVER_DOCUMENT' | 'VEHICLE_DOCUMENT';
        id: string;
      }[] = [
        { type: 'VEHICLE', id: vehicle.id },
        { type: 'DRIVER_DOCUMENT', id: licence.id },
      ];
      for (const type of ['RC', 'PUC', 'INSURANCE'] as const) {
        const doc = await vehicleDocs.create({
          vehicleId: vehicle.id,
          documentType: type,
          status: 'PENDING',
        });
        owners.push({ type: 'VEHICLE_DOCUMENT', id: doc.id });
      }
      for (const owner of owners)
        await db.withTransaction(async (client) => {
          const image = await images.create(
            {
              ownerType: owner.type,
              ownerId: owner.id,
              imageType: 'DOCUMENT',
              imagekitFileId: randomUUID(),
              url: 'https://example.test/image',
              mimeType: 'image/png',
            },
            client,
          );
          if (owner.type !== 'VEHICLE')
            await images.markPrivate(image.id, client);
        });
      return { userId, profile, vehicleId: vehicle.id, licenceId: licence.id };
    }
    function media() {
      const provider = {
        uploadVehiclePhoto: vi.fn(async () => ({
          fileId: randomUUID(),
          url: 'https://example.test/vehicle.png',
        })),
        uploadPrivate: vi.fn(async () => ({
          fileId: randomUUID(),
          filePath: '/test/document.bin',
        })),
        deleteFile: vi.fn().mockResolvedValue(undefined),
        stagedFiles: vi.fn(async function* () {}),
      };
      const cleanup = new MediaCleanupService(
        jobs,
        provider as never,
        logger as never,
      );
      const service = new MediaService(
        images,
        provider as never,
        profiles,
        docs,
        vehicles,
        vehicleDocs,
        db as never,
        logger as never,
        users,
        reviews,
        cleanup,
      );
      return { service, provider, cleanup };
    }
    beforeAll(async () => {
      const result = await pool.query<{ name: string }>(
        'SELECT current_database() name',
      );
      if (
        ![
          'cab_onboarding_test',
          'cab_admin_upgrade_onboarding',
          'cab_corrections_validation',
        ].includes(result.rows[0].name)
      )
        throw new Error('Use disposable cab_onboarding_test only');
      adminId = await user('Admin');
    });
    afterAll(async () => {
      await pool.end();
    });
    it('serializes two concurrent vehicle creations', async () => {
      const f = await draft(false);
      const results = await Promise.allSettled(
        ['A', 'B'].map((suffix) =>
          onboarding.addVehicle(f.userId, {
            vehicle_number: `${randomUUID().slice(0, 15)}${suffix}`,
            vehicle_type: 'SEATER_4',
          }),
        ),
      );
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(await vehicles.listByProfileId(f.profile.id)).toHaveLength(1);
    });
    it('returns the same review for concurrent repeated submissions', async () => {
      const f = await draft();
      const [a, b] = await Promise.all([
        onboarding.submitForVerification(f.userId),
        onboarding.submitForVerification(f.userId),
      ]);
      expect(a.verification.id).toBe(b.verification.id);
      const result = await pool.query(
        'SELECT id FROM driver_verifications WHERE driver_profile_id=$1',
        [f.profile.id],
      );
      expect(result.rows).toHaveLength(1);
    });
    it('rejects a stale concurrent metadata edit', async () => {
      const f = await draft();
      const result = await Promise.allSettled(
        ['ONE', 'TWO'].map((number) =>
          onboarding.addDocument(
            f.userId,
            {
              document_type: 'DRIVING_LICENCE',
              document_number: number,
              expected_revision: 0,
            },
            f.licenceId,
          ),
        ),
      );
      expect(result.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(result.filter((r) => r.status === 'rejected')).toHaveLength(1);
    });
    it('cleans up a late upload after submission and preserves the submitted image', async () => {
      const f = await draft();
      const m = media();
      const started = deferred(),
        resume = deferred();
      const old = await images.listByOwner('DRIVER_DOCUMENT', f.licenceId);
      const fileId = randomUUID();
      m.provider.uploadPrivate.mockImplementationOnce(async () => {
        started.resolve();
        await resume.promise;
        return { fileId, filePath: '/late.bin' };
      });
      const uploading = m.service.uploadDocument(f.userId, {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: f.licenceId,
        expected_revision: 0,
        content_base64: png.toString('base64'),
      });
      const outcome = uploading.then(
        () => null,
        (error: unknown) => error,
      );
      await started.promise;
      await onboarding.submitForVerification(f.userId);
      resume.resolve();
      expect(await outcome).toBeInstanceOf(Error);
      expect(
        (await images.listByOwner('DRIVER_DOCUMENT', f.licenceId))[0].id,
      ).toBe(old[0].id);
      expect(m.provider.deleteFile).toHaveBeenCalledWith(fileId);
    });
    it('atomically replaces one image, advances revision and queues its predecessor', async () => {
      const f = await draft();
      const m = media();
      const old = await images.listByOwner('DRIVER_DOCUMENT', f.licenceId);
      const result = await m.service.uploadDocument(f.userId, {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: f.licenceId,
        expected_revision: 0,
        content_base64: png.toString('base64'),
      });
      expect(result.document_revision).toBe(1);
      expect(
        await images.listByOwner('DRIVER_DOCUMENT', f.licenceId),
      ).toHaveLength(1);
      expect(
        (
          await pool.query(
            'SELECT file_id FROM media_cleanup_jobs WHERE file_id=$1',
            [old[0].imagekit_file_id],
          )
        ).rows,
      ).toHaveLength(1);
      await expect(
        db.withTransaction((client) =>
          images.create(
            {
              ownerType: 'DRIVER_DOCUMENT',
              ownerId: f.licenceId,
              imageType: 'DOCUMENT',
              imagekitFileId: old[0].imagekit_file_id,
              url: '/old',
            },
            client,
          ),
        ),
      ).rejects.toThrow('scheduled for cleanup');
    });
    it('rolls back a failed attachment and deletes the unused new file', async () => {
      const f = await draft();
      const m = media();
      const old = await images.listByOwner('DRIVER_DOCUMENT', f.licenceId);
      const failure = vi
        .spyOn(docs, 'saveState')
        .mockRejectedValueOnce(new Error('Attachment failed'));
      try {
        await expect(
          m.service.uploadDocument(f.userId, {
            owner_type: 'DRIVER_DOCUMENT',
            owner_id: f.licenceId,
            expected_revision: 0,
            content_base64: png.toString('base64'),
          }),
        ).rejects.toThrow('Attachment failed');
      } finally {
        failure.mockRestore();
      }
      expect(
        (await images.listByOwner('DRIVER_DOCUMENT', f.licenceId))[0].id,
      ).toBe(old[0].id);
      expect(m.provider.deleteFile).toHaveBeenCalledOnce();
    });
    async function approveApplication(f: {
      userId: string;
      vehicleId: string;
      profile: { id: string };
    }) {
      await onboarding.submitForVerification(f.userId);
      const app = await onboarding.getOnboarding(f.userId);
      for (const d of app.documents)
        await admin.reviewDocument(
          d.id,
          {
            operation_id: randomUUID(),
            decision: 'APPROVED',
            expected_revision: d.revision,
            reason: 'Checked document',
          },
          adminId,
        );
      for (const d of app.vehicles[0].documents)
        await admin.reviewVehicleDocument(
          d.id,
          {
            operation_id: randomUUID(),
            decision: 'APPROVED',
            expected_revision: d.revision,
            reason: 'Checked document',
          },
          adminId,
        );
      for (const group of ['DETAILS', 'PHOTOS'] as const) {
        const vehicle = await vehicles.findById(f.vehicleId);
        await admin.reviewVehicle(
          f.vehicleId,
          {
            operation_id: randomUUID(),
            decision: 'APPROVED',
            group,
            expected_revision: vehicle!.review_revision,
            reason: 'Checked vehicle',
          },
          adminId,
        );
      }
      await admin.reviewProfile(f.profile.id, adminId, {
        operation_id: randomUUID(),
        decision: 'APPROVED',
        reason: 'All checks passed',
      });
    }

    it('immediately opens multiple document corrections and preserves approved items', async () => {
      const f = await draft();
      await approveApplication(f);
      const before = await vehicleDocs.listByVehicleId(f.vehicleId);
      const rc = before.find((d) => d.document_type === 'RC')!;
      const licence = await docs.findById(f.licenceId);
      await admin.reviewDocument(
        f.licenceId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: licence!.revision,
          correction_mode: 'IMAGE',
          reason: 'Replace licence image',
        },
        adminId,
      );
      await admin.reviewVehicleDocument(
        rc.id,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: rc.revision,
          correction_mode: 'METADATA',
          metadata_fields: ['expiry_date'],
          reason: 'Correct RC expiry',
        },
        adminId,
      );
      let app = await onboarding.getOnboarding(f.userId);
      expect(app.application_status).toBe('REJECTED');
      expect(app.profile.status).toBe('APPROVED');
      expect(app.ride_eligible).toBe(false);
      expect(app.verification?.correction_document_ids).toEqual(
        expect.arrayContaining([f.licenceId, rc.id]),
      );
      expect(app.can_edit_vehicle).toBe(false);
      expect(app.can_edit_vehicle_photos).toBe(false);
      const m = media();
      await m.service.uploadDocument(f.userId, {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: f.licenceId,
        expected_revision: app.documents.find((d) => d.id === f.licenceId)!
          .revision,
        content_base64: png.toString('base64'),
      });
      const currentRc = await vehicleDocs.findById(rc.id);
      await onboarding.addVehicleDocument(
        f.userId,
        f.vehicleId,
        {
          document_type: 'RC',
          expected_revision: currentRc!.revision,
          expiry_date: '2029-01-01',
        },
        rc.id,
      );
      await onboarding.submitForVerification(f.userId);
      app = await onboarding.getOnboarding(f.userId);
      expect(app.application_status).toBe('PENDING_VERIFICATION');
      for (const d of app.vehicles[0].documents.filter(
        (d) => d.document_type !== 'RC',
      )) {
        const saved = before.find((old) => old.id === d.id)!;
        expect(d.status).toBe('APPROVED');
        expect(d.revision).toBe(saved.revision);
      }
    });

    it('corrects only flagged vehicle groups and requires a saved replacement photo', async () => {
      const f = await draft();
      await approveApplication(f);
      const original = await onboarding.getOnboarding(f.userId);
      let vehicle = (await vehicles.findById(f.vehicleId))!;
      await admin.reviewVehicle(
        f.vehicleId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          group: 'DETAILS',
          expected_revision: vehicle.review_revision,
          reason: 'Correct model',
        },
        adminId,
      );
      let app = await onboarding.getOnboarding(f.userId);
      expect(app.can_edit_vehicle).toBe(true);
      expect(app.can_edit_vehicle_photos).toBe(false);
      const m = media();
      await expect(
        m.service.uploadVehiclePhoto(f.userId, f.vehicleId, {
          expected_revision: app.vehicles[0].review_revision,
          content_base64: png.toString('base64'),
        }),
      ).rejects.toThrow();
      vehicle = (await vehicles.findById(f.vehicleId))!;
      await admin.reviewVehicle(
        f.vehicleId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          group: 'PHOTOS',
          expected_revision: vehicle.review_revision,
          reason: 'Replace blurry photo',
        },
        adminId,
      );
      vehicle = (await vehicles.findById(f.vehicleId))!;
      await onboarding.addVehicle(
        f.userId,
        {
          vehicle_number: vehicle.vehicle_number,
          vehicle_type: 'SEATER_4',
          model: 'Corrected model',
          expected_revision: vehicle.review_revision,
        },
        f.vehicleId,
      );
      expect((await onboarding.getOnboarding(f.userId)).can_edit_vehicle).toBe(
        false,
      );
      await m.service.deleteImage(
        f.userId,
        original.vehicles[0].images[0].id,
        vehicle.review_revision,
      );
      expect((await onboarding.getOnboarding(f.userId)).can_submit).toBe(false);
      await expect(
        onboarding.submitForVerification(f.userId),
      ).rejects.toThrow();
      const uploaded = await m.service.uploadVehiclePhoto(
        f.userId,
        f.vehicleId,
        {
          expected_revision: vehicle.review_revision,
          content_base64: png.toString('base64'),
        },
      );
      expect((await onboarding.getOnboarding(f.userId)).can_submit).toBe(true);
      await m.service.deleteImage(
        f.userId,
        uploaded.image.id,
        vehicle.review_revision,
      );
      expect((await onboarding.getOnboarding(f.userId)).can_submit).toBe(false);
      await m.service.uploadVehiclePhoto(f.userId, f.vehicleId, {
        expected_revision: vehicle.review_revision,
        content_base64: png.toString('base64'),
      });
      await onboarding.submitForVerification(f.userId);
      app = await onboarding.getOnboarding(f.userId);
      expect(app.application_status).toBe('PENDING_VERIFICATION');
      expect(app.vehicles[0].id).toBe(f.vehicleId);
      expect(app.vehicles[0].photos_review_status).toBe('PENDING');
      expect(app.can_edit_vehicle_photos).toBe(false);
      expect(
        app.vehicles[0].documents.map((d) => [d.id, d.status, d.revision]),
      ).toEqual(
        original.vehicles[0].documents.map((d) => [d.id, d.status, d.revision]),
      );
      await expect(
        admin.reviewProfile(f.profile.id, adminId, {
          operation_id: randomUUID(),
          decision: 'APPROVED',
          reason: 'Try before reviewing vehicle',
        }),
      ).rejects.toThrow('vehicle details');
      await approveApplication(f);
      expect((await onboarding.getOnboarding(f.userId)).ride_eligible).toBe(
        true,
      );
    });

    it('requires supplied optional documents to pass review before overall approval', async () => {
      const f = await draft();
      await approveApplication(f);
      const aadhaar = await docs.create({
        driverProfileId: f.profile.id,
        documentType: 'AADHAAR',
        status: 'APPROVED',
      });
      await admin.reviewDocument(
        aadhaar.id,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: aadhaar.revision,
          correction_mode: 'IMAGE',
          reason: 'Use masked Aadhaar',
        },
        adminId,
      );
      const rejected = (await docs.findById(aadhaar.id))!;
      const m = media();
      await m.service.uploadDocument(f.userId, {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: aadhaar.id,
        expected_revision: rejected.revision,
        aadhaar_copy: 'MASKED',
        content_base64: png.toString('base64'),
      });
      await onboarding.submitForVerification(f.userId);
      await expect(
        admin.reviewProfile(f.profile.id, adminId, {
          operation_id: randomUUID(),
          decision: 'APPROVED',
          reason: 'Try before reviewing Aadhaar',
        }),
      ).rejects.toThrow('all supplied documents');
      expect(
        (await onboarding.getOnboarding(f.userId)).application_status,
      ).toBe('PENDING_VERIFICATION');
      const pending = (await docs.findById(aadhaar.id))!;
      await admin.reviewDocument(
        aadhaar.id,
        {
          operation_id: randomUUID(),
          decision: 'APPROVED',
          expected_revision: pending.revision,
          reason: 'Masked copy checked',
        },
        adminId,
      );
      await admin.reviewProfile(f.profile.id, adminId, {
        operation_id: randomUUID(),
        decision: 'APPROVED',
        reason: 'All checks passed',
      });
      expect((await onboarding.getOnboarding(f.userId)).ride_eligible).toBe(
        true,
      );
    });

    it('discards a photo upload when a newer review supersedes its correction revision', async () => {
      const f = await draft();
      await approveApplication(f);
      let vehicle = (await vehicles.findById(f.vehicleId))!;
      await admin.reviewVehicle(
        f.vehicleId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          group: 'PHOTOS',
          expected_revision: vehicle.review_revision,
          reason: 'Replace photo',
        },
        adminId,
      );
      vehicle = (await vehicles.findById(f.vehicleId))!;
      const m = media();
      const started = deferred(),
        resume = deferred();
      const fileId = randomUUID();
      m.provider.uploadVehiclePhoto.mockImplementationOnce(async () => {
        started.resolve();
        await resume.promise;
        return { fileId, url: 'https://example.test/stale.png' };
      });
      const upload = m.service.uploadVehiclePhoto(f.userId, f.vehicleId, {
        expected_revision: vehicle.review_revision,
        content_base64: png.toString('base64'),
      });
      await started.promise;
      await admin.reviewVehicle(
        f.vehicleId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          group: 'PHOTOS',
          expected_revision: vehicle.review_revision,
          reason: 'Updated photo instructions',
        },
        adminId,
      );
      const rejectedUpload = expect(upload).rejects.toThrow(
        'Vehicle review changed',
      );
      resume.resolve();
      await rejectedUpload;
      expect(m.provider.deleteFile).toHaveBeenCalledWith(fileId);
      expect((await onboarding.getOnboarding(f.userId)).can_submit).toBe(false);
    });

    it('supports metadata-only resubmission and preserves approved documents', async () => {
      const f = await draft();
      await onboarding.submitForVerification(f.userId);
      const app = await onboarding.getOnboarding(f.userId);
      for (const document of app.vehicles[0].documents)
        await admin.reviewVehicleDocument(
          document.id,
          {
            operation_id: randomUUID(),
            reason: 'Reviewed supporting documents',
            decision: 'APPROVED',
            expected_revision: document.revision,
          },
          adminId,
        );
      await admin.reviewDocument(
        f.licenceId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: 0,
          rejection_reason: 'Incorrect expiry',
          correction_mode: 'METADATA',
          metadata_fields: ['expiry_date'],
        },
        adminId,
      );
      await admin.reviewProfile(f.profile.id, adminId, {
        operation_id: randomUUID(),
        decision: 'REJECTED',
        rejection_reason: 'Correct licence expiry',
      });
      const rejected = await docs.findById(f.licenceId);
      await onboarding.addDocument(
        f.userId,
        {
          document_type: 'DRIVING_LICENCE',
          expected_revision: rejected?.revision,
          expiry_date: '2028-01-01',
        },
        f.licenceId,
      );
      expect((await docs.findById(f.licenceId))?.status).toBe('PENDING');
      expect(
        await images.listByOwner('DRIVER_DOCUMENT', f.licenceId),
      ).toHaveLength(1);
      await onboarding.submitForVerification(f.userId);
      expect(
        (await vehicleDocs.listByVehicleId(f.vehicleId)).every(
          (doc) => doc.status === 'APPROVED',
        ),
      ).toBe(true);
    });
    it('keeps approved identity while any document corrections disable eligibility', async () => {
      const f = await draft();
      await pool.query(
        "UPDATE driver_profiles SET status='APPROVED' WHERE id=$1",
        [f.profile.id],
      );
      await pool.query(
        "UPDATE driver_documents SET status='APPROVED' WHERE driver_profile_id=$1",
        [f.profile.id],
      );
      await pool.query(
        "UPDATE vehicle_documents SET status='APPROVED' WHERE vehicle_id=$1",
        [f.vehicleId],
      );
      const aadhaar = await docs.create({
        driverProfileId: f.profile.id,
        documentType: 'AADHAAR',
        status: 'APPROVED',
      });
      await admin.reviewDocument(
        aadhaar.id,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: 0,
          rejection_reason: 'Upload a masked copy',
          correction_mode: 'IMAGE',
        },
        adminId,
      );
      await admin.requestCorrections(
        f.profile.id,
        adminId,
        'Correct optional Aadhaar',
        randomUUID(),
      );
      let state = await onboarding.getOnboarding(f.userId);
      expect(state.application_status).toBe('REJECTED');
      expect(state.profile.status).toBe('APPROVED');
      expect(state.ride_eligible).toBe(false);
      await admin.reviewDocument(
        f.licenceId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: 0,
          rejection_reason: 'Invalid image',
          correction_mode: 'IMAGE',
        },
        adminId,
      );
      state = await onboarding.getOnboarding(f.userId);
      expect(state.ride_eligible).toBe(false);
      expect(state.profile.status).toBe('APPROVED');
      await db.withTransaction(async (client) => {
        expect(
          await operations.eligibleDocuments(f.profile.id, f.vehicleId, client),
        ).toBe(false);
      });
    });
    it('lets an already-started ride finish during compliance correction but respects manual suspension', async () => {
      const f = await draft();
      await pool.query(
        "UPDATE driver_profiles SET status='APPROVED' WHERE id=$1",
        [f.profile.id],
      );
      const rides = new RideRepository(db as never),
        payments = new PaymentRepository(db as never);
      const rideService = new DriverRideService(
        db as never,
        operations,
        rides,
        profiles,
        payments,
        { buildRideDetail: async () => ({}) } as never,
        new RideStatusService(new RideStatusHistoryRepository(db as never)),
        new PaymentSummaryService(),
        { driver: { offerExpiryMinutes: 30 } } as never,
      );
      const booker = await user('Passenger');
      async function inProgress() {
        const result = await pool.query<{ id: string }>(
          `INSERT INTO rides(booked_by_user_id,trip_type,pickup_address,pickup_latitude,pickup_longitude,destination_address,destination_latitude,destination_longitude,distance_km,estimated_duration_minutes,pickup_at,estimated_fare,payment_option,status,requested_vehicle_category,driver_profile_id,vehicle_id) VALUES($1,'ONE_WAY','Pickup',1,1,'Destination',2,2,10,60,NOW(),0,'OFFLINE','IN_PROGRESS','SEATER_4',$2,$3) RETURNING id`,
          [booker, f.profile.id, f.vehicleId],
        );
        return result.rows[0].id;
      }
      const id = await inProgress();
      await admin.reviewDocument(
        f.licenceId,
        {
          operation_id: randomUUID(),
          decision: 'REJECTED',
          expected_revision: 0,
          rejection_reason: 'Renew licence',
          correction_mode: 'IMAGE',
        },
        adminId,
      );
      await admin.requestCorrections(
        f.profile.id,
        adminId,
        'Correct compliance documents',
        randomUUID(),
      );
      const detail = await rideService.detail(id, f.userId);
      expect(detail.permitted_actions).toContain('complete');
      await rideService.complete(id, f.userId, {
        operation_id: randomUUID(),
        expected_outstanding: 0,
        declared_cash: 0,
      });
      expect((await rides.findById(id))?.status).toBe('COMPLETED');
      const another = await inProgress();
      await admin.suspend(
        f.profile.id,
        adminId,
        'Manual suspension',
        randomUUID(),
      );
      await expect(
        rideService.complete(another, f.userId, {
          operation_id: randomUUID(),
          expected_outstanding: 0,
          declared_cash: 0,
        }),
      ).rejects.toThrow('Admin must resolve');
    });
  },
);
