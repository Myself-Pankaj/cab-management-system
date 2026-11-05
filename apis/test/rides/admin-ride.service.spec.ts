import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminRideService } from '../../libs/resources/src/rides/services/admin-ride.service.js';
import { RideErrors } from '../../libs/resources/src/rides/types/ride-errors.js';

describe('AdminRideService', () => {
  const databaseService = {
    withTransaction: vi.fn(async (work: (client: unknown) => Promise<unknown>) =>
      work({}),
    ),
  };
  const rideRepository = { findById: vi.fn(), assign: vi.fn() };
  const paymentRepository = { listByRideId: vi.fn() };
  const cancellationRepository = { create: vi.fn() };
  const profileRepository = { findById: vi.fn() };
  const vehicleRepository = { findById: vi.fn() };
  const userRepository = { findById: vi.fn() };
  const rideBookingService = { buildRideDetail: vi.fn() };
  const statusService = { recordTransition: vi.fn(), assertTransition: vi.fn() };
  const razorpayService = { isConfigured: vi.fn(), createRefund: vi.fn() };

  let service: AdminRideService;

  const ride = {
    id: 'ride-1',
    booked_by_user_id: 'user-1',
    driver_profile_id: null,
    vehicle_id: null,
    requested_vehicle_category: 'SEATER_4' as const,
    passenger_count: 1,
    trip_type: 'ONE_WAY' as const,
    pickup_address: 'A',
    pickup_exact_location: null,
    pickup_latitude: '1',
    pickup_longitude: '1',
    destination_address: 'B',
    exact_destination: null,
    destination_latitude: '2',
    destination_longitude: '2',
    distance_km: '10',
    estimated_duration_minutes: 20,
    pickup_at: new Date(),
    return_at: null,
    estimated_fare: '170',
    final_fare: null,
    payment_option: 'ONLINE' as const,
    status: 'PENDING_ASSIGNMENT' as const,
    assigned_by: null,
    assigned_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    cancelled_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminRideService(
      databaseService as never,
      rideRepository as never,
      paymentRepository as never,
      cancellationRepository as never,
      profileRepository as never,
      vehicleRepository as never,
      userRepository as never,
      rideBookingService as never,
      statusService as never,
      razorpayService as never,
    );
    rideRepository.findById.mockResolvedValue(ride);
  });

  it('rejects assignment when vehicle category mismatches', async () => {
    profileRepository.findById.mockResolvedValue({
      id: 'profile-1',
      status: 'APPROVED',
    });
    vehicleRepository.findById.mockResolvedValue({
      id: 'vehicle-1',
      driver_profile_id: 'profile-1',
      vehicle_type: 'SEATER_7',
    });

    await expect(
      service.assignRide('ride-1', 'admin-1', {
        driver_profile_id: 'profile-1',
        vehicle_id: 'vehicle-1',
      }),
    ).rejects.toMatchObject({ errorCode: 'VEHICLE_CATEGORY_MISMATCH' });
  });
});
