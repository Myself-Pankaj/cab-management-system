import { makeCorrection } from '../../libs/resources/src/drivers/types/onboarding-policy.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { onboardingFixture } from './onboarding.fixture.js';
import { DriverErrors } from '../../libs/resources/src/drivers/types/driver-errors.js';

describe('DriverOnboardingService', () => {
  let f: ReturnType<typeof onboardingFixture>;
  beforeEach(() => {
    f = onboardingFixture();
  });

  it('submits a complete application and creates one pending review', async () => {
    const result = await f.service.submitForVerification('user-1');
    expect(result.profile.status).toBe('PENDING_VERIFICATION');
    expect(f.profiles.lockById).toHaveBeenCalledWith(f.profile.id, f.client);
    expect(f.verifications.create).toHaveBeenCalledExactlyOnceWith(
      f.profile.id,
      f.client,
    );
  });

  it.each(['DRIVING_LICENCE', 'RC', 'PUC', 'INSURANCE'])(
    'requires an upload for %s',
    async (missing) => {
      const original = f.images.listByOwner.getMockImplementation()!;
      f.images.listByOwner.mockImplementation(async (type, id) =>
        id === missing ? [] : original(type, id),
      );
      await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
        DriverErrors.documentsIncomplete(),
      );
      expect(f.verifications.create).not.toHaveBeenCalled();
    },
  );

  it.each(['DRIVING_LICENCE', 'RC', 'PUC', 'INSURANCE'])(
    'does not count rejected %s as complete',
    async (rejected) => {
      [...f.driverDocuments, ...f.vehicleDocuments].find(
        (doc) => doc.document_type === rejected,
      )!.status = 'REJECTED';
      await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
        DriverErrors.documentsIncomplete(),
      );
    },
  );

  it('allows submission without bank details or Aadhaar', async () => {
    f.banks.findByProfileId.mockResolvedValue(null);
    f.documents.listByProfileId.mockResolvedValue(
      f.driverDocuments.filter((d) => d.document_type !== 'AADHAAR'),
    );
    await expect(
      f.service.submitForVerification('user-1'),
    ).resolves.toHaveProperty('profile.status', 'PENDING_VERIFICATION');
  });
  it('rejects full Aadhaar numbers', async () => {
    await expect(
      f.service.addDocument('user-1', {
        document_type: 'AADHAAR',
        document_number: '123456789012',
      }),
    ).rejects.toThrow('last four');
  });

  it('always requires an active registered vehicle', async () => {
    f.vehicle.is_active = false;
    await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
      DriverErrors.vehicleRequired(),
    );
  });

  it('requires a photo for every active vehicle before submission', async () => {
    f.vehicles.listByProfileId.mockResolvedValue([
      f.vehicle,
      { ...f.vehicle, id: 'vehicle-2' },
    ]);
    const original = f.images.listByOwner.getMockImplementation()!;
    f.images.listByOwner.mockImplementation(async (type, id) =>
      type === 'VEHICLE' && id === 'vehicle-2' ? [] : original(type, id),
    );
    const application = await f.service.getOnboarding('user-1');
    expect(application.checklist.vehicle_photo).toBe(false);
    expect(application.complete).toBe(false);
    await expect(
      f.service.assertComplete(f.profile.id, f.client),
    ).rejects.toEqual(DriverErrors.vehiclePhotoRequired());
    expect(f.verifications.create).not.toHaveBeenCalled();
  });

  it('accepts photos on every active vehicle and ignores inactive vehicles without photos', async () => {
    f.vehicles.listByProfileId.mockResolvedValue([
      f.vehicle,
      { ...f.vehicle, id: 'vehicle-2' },
      { ...f.vehicle, id: 'vehicle-inactive', is_active: false },
    ]);
    const original = f.images.listByOwner.getMockImplementation()!;
    f.images.listByOwner.mockImplementation(async (type, id) =>
      id === 'vehicle-inactive' ? [] : original(type, id),
    );
    expect((await f.service.getOnboarding('user-1')).complete).toBe(true);
  });

  it('requires RC and PUC for every active vehicle', async () => {
    f.vehicles.listByProfileId.mockResolvedValue([
      f.vehicle,
      { ...f.vehicle, id: 'vehicle-2' },
    ]);
    f.vehicleDocs.listByVehicleId.mockImplementation(async (id) =>
      id === 'vehicle-2' ? [] : f.vehicleDocuments,
    );
    await expect(
      f.service.assertComplete(f.profile.id, f.client),
    ).rejects.toEqual(DriverErrors.documentsIncomplete());
  });

  it.each(['APPROVED', 'SUSPENDED'])(
    'blocks edits and submission in %s',
    async (status) => {
      f.profile.status = status;
      f.verification.status = status;
      await expect(
        f.service.addDocument('user-1', { document_type: 'AADHAAR' }),
      ).rejects.toEqual(DriverErrors.profileNotEditable());
      await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
        DriverErrors.profileNotEditable(),
      );
    },
  );

  it('corrects metadata on the same rejected record and then locks it pending review', async () => {
    f.profile.status = 'REJECTED';
    f.verification.status = 'REJECTED';
    const doc = f.driverDocuments[0];
    f.verification.correction_document_ids = [doc.id];
    doc.status = 'REJECTED';
    doc.correction = makeCorrection(doc, 'METADATA', ['document_number']);
    await f.service.addDocument('user-1', {
      document_type: 'AADHAAR',
      document_number: '1234',
      expected_revision: 0,
    });
    expect(f.documents.create).not.toHaveBeenCalled();
    expect(f.documents.saveState).toHaveBeenCalledTimes(1);
    expect(doc.status).toBe('PENDING');
    await expect(
      f.service.addDocument('user-1', {
        document_type: 'AADHAAR',
        document_number: '5678',
        expected_revision: 1,
      }),
    ).rejects.toThrow('Only documents');
  });

  it('reuses a saved vehicle document on upload retry', async () => {
    await f.service.addVehicleDocument('user-1', f.vehicle.id, {
      document_type: 'RC',
      expected_revision: 0,
    });
    expect(f.vehicleDocs.create).not.toHaveBeenCalled();
    expect(f.vehicleDocs.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'RC', expectedRevision: 0 }),
      f.client,
    );
  });

  it('rejects updates to another driver’s vehicle or document', async () => {
    f.vehicles.findById.mockResolvedValue({
      ...f.vehicle,
      driver_profile_id: 'someone-else',
    });
    await expect(
      f.service.addVehicleDocument('user-1', 'vehicle-1', {
        document_type: 'RC',
      }),
    ).rejects.toEqual(DriverErrors.vehicleNotFound());
    await expect(
      f.service.addVehicle(
        'user-1',
        { vehicle_number: 'KA01AB1234', vehicle_type: 'SEATER_4' },
        'vehicle-1',
      ),
    ).rejects.toEqual(DriverErrors.vehicleNotFound());
    await expect(
      f.service.addDocument(
        'user-1',
        { document_type: 'AADHAAR' },
        'another-document',
      ),
    ).rejects.toEqual(DriverErrors.documentNotFound());
  });

  it('returns saved details, checklist and the latest rejection reason', async () => {
    f.verifications.findLatestByProfileId.mockResolvedValue({
      ...f.verification,
      status: 'REJECTED',
      rejection_reason: 'Unreadable licence',
    });
    const result = await f.service.getOnboarding('user-1');
    expect(result.complete).toBe(true);
    expect(result.verification?.rejection_reason).toBe('Unreadable licence');
    expect(result.vehicles[0].documents).toHaveLength(3);
  });

  it('serializes duplicate submissions using the current locked status', async () => {
    f.profiles.updateStatus.mockImplementation(async (_id, status) => {
      f.profile.status = status;
      return { ...f.profile };
    });
    await f.service.submitForVerification('user-1');
    await expect(
      f.service.submitForVerification('user-1'),
    ).resolves.toHaveProperty('verification.id', f.verification.id);
    expect(f.verifications.create).toHaveBeenCalledTimes(1);
  });
  it('blocks legacy rejection resubmission without a selected correction cycle', async () => {
    f.profile.status = 'REJECTED';
    f.verification.status = 'REJECTED';
    expect((await f.service.getOnboarding('user-1')).can_submit).toBe(false);
    await expect(f.service.submitForVerification('user-1')).rejects.toThrow(
      'Admin must select',
    );
  });
});
