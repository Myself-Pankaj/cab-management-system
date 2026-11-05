import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RideBookingService } from '../../libs/resources/src/rides/services/ride-booking.service.js';

describe('RideBookingService', () => {
  const databaseService = {
    withTransaction: vi.fn(async (work: (client: unknown) => Promise<unknown>) =>
      work({}),
    ),
  };
  const rideRepository = { create: vi.fn(), findByIdForBooker: vi.fn() };
  const passengerRepository = { create: vi.fn(), listByRideId: vi.fn() };
  const paymentRepository = { create: vi.fn(), listByRideId: vi.fn() };
  const historyRepository = { listByRideId: vi.fn().mockResolvedValue([]) };
  const rideQuoteService = {
    quote: vi.fn().mockResolvedValue({
      distance_km: 10,
      estimated_duration_minutes: 20,
      fare_breakdown: { estimated_fare_inr: 170 },
    }),
  };
  const fareCalculator = {
    splitPartialPayment: vi.fn().mockReturnValue({ advance: 51, remainder: 119 }),
  };
  const statusService = { recordTransition: vi.fn() };
  const paymentSummaryService = {
    summarize: vi.fn().mockReturnValue({
      estimated_fare: 170,
      paid_amount: 0,
      remaining_amount: 170,
      summary_status: 'UNPAID',
    }),
  };
  const razorpayService = { createOrder: vi.fn(), getKeyId: vi.fn() };

  let service: RideBookingService;

  const createdRide = {
    id: 'ride-1',
    booked_by_user_id: 'booker-1',
    driver_profile_id: null,
    vehicle_id: null,
    requested_vehicle_category: 'SEATER_4' as const,
    passenger_count: 1,
    trip_type: 'ONE_WAY' as const,
    pickup_address: 'A',
    pickup_exact_location: null,
    pickup_latitude: '28.6',
    pickup_longitude: '77.2',
    destination_address: 'B',
    exact_destination: null,
    destination_latitude: '28.5',
    destination_longitude: '77.3',
    distance_km: '10',
    estimated_duration_minutes: 20,
    pickup_at: new Date('2026-09-20T10:00:00.000Z'),
    return_at: null,
    estimated_fare: '170',
    final_fare: null,
    payment_option: 'PARTIAL' as const,
    status: 'PENDING_PAYMENT' as const,
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
    service = new RideBookingService(
      databaseService as never,
      rideRepository as never,
      passengerRepository as never,
      paymentRepository as never,
      historyRepository as never,
      rideQuoteService as never,
      fareCalculator as never,
      statusService as never,
      paymentSummaryService as never,
      razorpayService as never,
    );
    rideRepository.create.mockResolvedValue(createdRide);
    passengerRepository.listByRideId.mockResolvedValue([
      {
        id: 'passenger-1',
        ride_id: 'ride-1',
        name: 'Traveler',
        phone: '+919999999999',
        is_primary: true,
        created_at: new Date(),
      },
    ]);
    paymentRepository.listByRideId.mockResolvedValue([]);
  });

  it('creates ride with separate booker and traveling passenger', async () => {
    const dto = {
      vehicle_category: 'SEATER_4' as const,
      trip_type: 'ONE_WAY' as const,
      pickup_address: 'A',
      pickup_latitude: 28.6,
      pickup_longitude: 77.2,
      destination_address: 'B',
      destination_latitude: 28.5,
      destination_longitude: 77.3,
      pickup_at: '2026-09-20T10:00:00.000Z',
      payment_option: 'PARTIAL' as const,
      passengers: [{ name: 'Traveler', phone: '+919999999999', is_primary: true }],
    };

    await service.createRide('booker-1', dto);

    expect(rideRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bookedByUserId: 'booker-1',
        requestedVehicleCategory: 'SEATER_4',
        passengerCount: 1,
      }),
      expect.anything(),
    );
    expect(passengerRepository.create).toHaveBeenCalledWith(
      'ride-1',
      'Traveler',
      '+919999999999',
      true,
      expect.anything(),
    );
    expect(paymentRepository.create).toHaveBeenCalledTimes(2);
  });
});
