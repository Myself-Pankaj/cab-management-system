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

  it.each(['AADHAAR', 'DRIVING_LICENCE', 'RC', 'PUC'])(
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

  it.each(['AADHAAR', 'DRIVING_LICENCE', 'RC', 'PUC'])(
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

  it.each([
    'account_holder_name',
    'account_number',
    'ifsc',
    'bank_name',
  ] as const)('rejects blank bank %s', async (key) => {
    f.bank[key] = '  ';
    await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
      DriverErrors.bankDetailsMissing(),
    );
  });

  it('always requires an active registered vehicle', async () => {
    f.vehicle.is_active = false;
    await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
      DriverErrors.vehicleRequired(),
    );
  });

  it('requires RC and PUC for every active vehicle', async () => {
    f.vehicles.listByProfileId.mockResolvedValue([
      f.vehicle,
      { ...f.vehicle, id: 'vehicle-2' },
    ]);
    f.vehicleDocs.listByVehicleId.mockImplementation(async (id) =>
      id === 'vehicle-2' ? [] : f.vehicleDocuments,
    );
    await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
      DriverErrors.documentsIncomplete(),
    );
  });

  it.each(['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED'])(
    'blocks edits and submission in %s',
    async (status) => {
      f.profile.status = status;
      await expect(
        f.service.addDocument('user-1', { document_type: 'AADHAAR' }),
      ).rejects.toEqual(DriverErrors.profileNotEditable());
      await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
        DriverErrors.profileNotEditable(),
      );
    },
  );

  it('reuses a saved document on upload retry and allows corrections after rejection', async () => {
    f.profile.status = 'REJECTED';
    await f.service.addDocument('user-1', {
      document_type: 'AADHAAR',
      document_number: 'updated',
    });
    await f.service.addDocument('user-1', {
      document_type: 'AADHAAR',
      document_number: 'updated',
    });
    expect(f.documents.create).not.toHaveBeenCalled();
    expect(f.documents.updateDetails).toHaveBeenCalledWith(
      'AADHAAR',
      'updated',
      f.client,
    );
    await expect(
      f.service.submitForVerification('user-1'),
    ).resolves.toHaveProperty('profile.status', 'PENDING_VERIFICATION');
  });

  it('reuses a saved vehicle document on upload retry', async () => {
    await f.service.addVehicleDocument('user-1', f.vehicle.id, {
      document_type: 'RC',
    });
    expect(f.vehicleDocs.create).not.toHaveBeenCalled();
    expect(f.vehicleDocs.updateDetails).toHaveBeenCalledWith(
      'RC',
      null,
      null,
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
    expect(result.vehicles[0].documents).toHaveLength(2);
  });

  it('serializes duplicate submissions using the current locked status', async () => {
    f.profiles.updateStatus.mockImplementation(async (_id, status) => {
      f.profile.status = status;
      return { ...f.profile };
    });
    await f.service.submitForVerification('user-1');
    await expect(f.service.submitForVerification('user-1')).rejects.toEqual(
      DriverErrors.profileNotEditable(),
    );
    expect(f.verifications.create).toHaveBeenCalledTimes(1);
  });
});
