import { describe, it, expect, vi } from 'vitest';
import { AdminRideService } from '../../libs/resources/src/rides/services/admin-ride.service.js';
describe('Admin ride operations', () => {
  const operations = { assign: vi.fn(), start: vi.fn() };
  const service = new AdminRideService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    operations as never,
    {} as never,
  );
  it('routes assignment through the shared availability/eligibility operation', async () => {
    operations.assign.mockResolvedValue({ ok: true });
    await expect(
      service.assignRide('ride', 'admin', {
        operation_id: 'op',
        reason: 'Dispatch',
        driver_profile_id: 'driver',
        vehicle_id: 'vehicle',
      }),
    ).resolves.toEqual({ ok: true });
    expect(operations.assign).toHaveBeenCalledWith(
      'ride',
      'admin',
      'driver',
      'vehicle',
      { operation_id: 'op', reason: 'Dispatch' },
    );
  });
  it('does not permit generic completion or unaudited cash collection', async () => {
    await expect(
      service.updateStatus('ride', 'admin', { status: 'COMPLETED' }),
    ).rejects.toThrow('dedicated');
    await expect(service.markOfflinePaid('ride', 'payment')).rejects.toThrow(
      'completion',
    );
  });
});
