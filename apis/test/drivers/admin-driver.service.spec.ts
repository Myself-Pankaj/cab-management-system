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
    findLatestByProfileId: ReturnType<typeof vi.fn>;
    updateReview: ReturnType<typeof vi.fn>;
  };
  let service: AdminDriverService;
  beforeEach(() => {
    f = onboardingFixture();
    f.profile.status = 'PENDING_VERIFICATION';
    reviews = {
      findLatestByProfileId: vi.fn().mockResolvedValue(f.verification),
      updateReview: vi.fn(async (_id, status, _admin, reason) => ({
        ...f.verification,
        status,
        rejection_reason: reason,
        reviewed_at: new Date(),
      })),
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
      decision: 'APPROVED',
    });
    expect(result.profile?.status).toBe('APPROVED');
    expect(reviews.updateReview).toHaveBeenCalledWith(
      f.verification.id,
      'APPROVED',
      'admin',
      null,
      f.client,
    );
    expect(f.profiles.lockById).toHaveBeenCalledWith(f.profile.id, f.client);
  });
  it('revalidates completeness before approval', async () => {
    f.vehicleDocs.listByVehicleId.mockResolvedValue([]);
    await expect(
      service.reviewProfile(f.profile.id, 'admin', { decision: 'APPROVED' }),
    ).rejects.toEqual(DriverErrors.documentsIncomplete());
    expect(f.profiles.updateStatus).not.toHaveBeenCalled();
  });
  it('requires a nonblank rejection reason', async () => {
    await expect(
      service.reviewProfile(f.profile.id, 'admin', {
        decision: 'REJECTED',
        rejection_reason: '   ',
      }),
    ).rejects.toThrow('A rejection reason is required');
    expect(f.profiles.updateStatus).not.toHaveBeenCalled();
  });
  it('returns the application for corrections with a saved reason', async () => {
    const result = await service.reviewProfile(f.profile.id, 'admin', {
      decision: 'REJECTED',
      rejection_reason: ' Unreadable RC ',
    });
    expect(result.profile?.status).toBe('REJECTED');
    expect(result.verification?.rejection_reason).toBe('Unreadable RC');
  });
  it('rejects a second conflicting decision after the first commits', async () => {
    f.profiles.updateStatus.mockImplementation(async (_id, status) => {
      f.profile.status = status;
      return { ...f.profile };
    });
    await service.reviewProfile(f.profile.id, 'admin', {
      decision: 'APPROVED',
    });
    await expect(
      service.reviewProfile(f.profile.id, 'other-admin', {
        decision: 'REJECTED',
        rejection_reason: 'No',
      }),
    ).rejects.toEqual(DriverErrors.invalidStatusTransition());
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
