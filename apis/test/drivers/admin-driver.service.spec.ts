import { randomUUID } from 'node:crypto';
import { makeCorrection } from '../../libs/resources/src/drivers/types/onboarding-policy.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { AdminDriverService } from '../../libs/resources/src/drivers/services/admin-driver.service.js';
import { DriverErrors } from '../../libs/resources/src/drivers/types/driver-errors.js';
import { RolesGuard } from '../../libs/resources/src/auth/guards/roles.guard.js';
import { AdminDriversController } from '../../src/admin/admin-drivers.controller.js';
import { onboardingFixture } from './onboarding.fixture.js';

describe('Admin driver review', () => {
  let f: ReturnType<typeof onboardingFixture>;
  let reviews: {
    create: ReturnType<typeof vi.fn>;
    findLatestByProfileId: ReturnType<typeof vi.fn>;
    updateReview: ReturnType<typeof vi.fn>;
  };
  let service: AdminDriverService;
  beforeEach(() => {
    f = onboardingFixture();
    f.profile.status = 'PENDING_VERIFICATION';
    f.vehicle.details_review_status = 'APPROVED';
    f.vehicle.photos_review_status = 'APPROVED';
    [...f.driverDocuments, ...f.vehicleDocuments].forEach((d) => {
      d.status = 'APPROVED';
    });
    reviews = {
      create: f.verifications.create,
      findLatestByProfileId: vi.fn().mockResolvedValue(f.verification),
      updateReview: vi.fn(async (_id, status, _admin, reason) => {
        Object.assign(f.verification, {
          status,
          rejection_reason: reason,
          reviewed_at: new Date(),
        });
        return f.verification;
      }),
    };
    service = new AdminDriverService(
      f.user as never,
      f.profiles as never,
      f.documents as never,
      f.banks as never,
      f.vehicles as never,
      f.vehicleDocs as never,
      reviews as never,
      f.images as never,
      f.db as never,
      f.service,
    );
  });
  it('approves a complete application with one decision', async () => {
    const result = await service.reviewProfile(f.profile.id, 'admin', {
      operation_id: randomUUID(),
      reason: 'Reviewed supporting documents',
      decision: 'APPROVED',
    });
    expect(result.profile?.status).toBe('APPROVED');
    expect(reviews.updateReview).toHaveBeenCalledWith(
      f.verification.id,
      'APPROVED',
      'admin',
      null,
      f.client,
      undefined,
    );
    expect(f.profiles.lockById).toHaveBeenCalledWith(f.profile.id, f.client);
  });
  it('reopens an approved legacy application with an audited correction reason', async () => {
    f.profile.status = 'APPROVED';
    f.verification.status = 'APPROVED';
    const doc = f.vehicleDocuments[2];
    doc.status = 'REJECTED';
    doc.correction = makeCorrection(doc, 'IMAGE', []);
    const result = await service.requestCorrections(
      f.profile.id,
      'admin',
      'Insurance image required',
      randomUUID(),
    );
    expect(result.profile?.status).toBe('APPROVED');
    expect(f.profiles.audit).toHaveBeenCalledWith(
      f.profile.id,
      'PROFILE',
      null,
      'REJECTED',
      'admin',
      'Insurance image required',
      f.client,
    );
  });
  it('revalidates completeness before approval', async () => {
    f.vehicleDocs.listByVehicleId.mockResolvedValue([]);
    await expect(
      service.reviewProfile(f.profile.id, 'admin', {
        operation_id: randomUUID(),
        reason: 'Reviewed supporting documents',
        decision: 'APPROVED',
      }),
    ).rejects.toEqual(DriverErrors.documentsIncomplete());
    expect(f.profiles.updateStatus).not.toHaveBeenCalled();
  });
  it('requires a nonblank rejection reason', async () => {
    await expect(
      service.reviewProfile(f.profile.id, 'admin', {
        operation_id: randomUUID(),
        decision: 'REJECTED',
        rejection_reason: '   ',
      }),
    ).rejects.toThrow('A rejection reason is required');
    expect(f.profiles.updateStatus).not.toHaveBeenCalled();
  });
  it('returns the application for corrections with a saved reason', async () => {
    const doc = f.vehicleDocuments[0];
    doc.status = 'REJECTED';
    doc.correction = makeCorrection(doc, 'IMAGE', []);
    const result = await service.reviewProfile(f.profile.id, 'admin', {
      operation_id: randomUUID(),
      decision: 'REJECTED',
      rejection_reason: ' Unreadable RC ',
    });
    expect(result.profile?.status).toBe('REJECTED');
    expect(result.verification?.rejection_reason).toBe('Unreadable RC');
  });
  it('accepts the shared reason field for rejection without the legacy alias', async () => {
    const doc = f.vehicleDocuments[0];
    doc.status = 'REJECTED';
    doc.correction = makeCorrection(doc, 'IMAGE', []);
    const result = await service.reviewProfile(f.profile.id, 'admin', {
      operation_id: randomUUID(),
      decision: 'REJECTED',
      reason: 'Unreadable registration',
    });
    expect(result.verification?.rejection_reason).toBe(
      'Unreadable registration',
    );
  });
  it('rejects a second conflicting decision after the first commits', async () => {
    f.profiles.updateStatus.mockImplementation(async (_id, status) => {
      f.profile.status = status;
      return { ...f.profile };
    });
    await service.reviewProfile(f.profile.id, 'admin', {
      operation_id: randomUUID(),
      reason: 'Reviewed supporting documents',
      decision: 'APPROVED',
    });
    await expect(
      service.reviewProfile(f.profile.id, 'other-admin', {
        operation_id: randomUUID(),
        decision: 'REJECTED',
        rejection_reason: 'No',
      }),
    ).rejects.toEqual(DriverErrors.verificationNotFound());
    expect(reviews.updateReview).toHaveBeenCalledTimes(1);
  });
  it.each(['Passenger', 'Driver', null])(
    'denies admin review access to %s',
    (role) => {
      const guard = new RolesGuard(new Reflector());
      const context = {
        getHandler: () => function reviewHandler() {},
        getClass: () => AdminDriversController,
        switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
      } as unknown as ExecutionContext;
      expect(() => guard.canActivate(context)).toThrow(
        'Insufficient permissions',
      );
    },
  );
  it('allows admin review access', () => {
    const context = {
      getHandler: () => function reviewHandler() {},
      getClass: () => AdminDriversController,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'Admin' } }) }),
    } as unknown as ExecutionContext;
    expect(new RolesGuard(new Reflector()).canActivate(context)).toBe(true);
  });
});
