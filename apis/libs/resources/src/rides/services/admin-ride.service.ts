import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { DriverProfileRepository } from '../../drivers/repositories/driver-profile.repository.js';
import { VehicleRepository } from '../../drivers/repositories/vehicle.repository.js';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RideCancellationRepository } from '../repositories/ride-cancellation.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import type { AssignRideDto, CancelRideDto, UpdateRideStatusDto } from '../dto/ride.dto.js';
import { RideBookingService } from './ride-booking.service.js';
import { RideStatusService } from './ride-status.service.js';
import { RazorpayService } from './razorpay.service.js';
import { RideErrors } from '../types/ride-errors.js';
import { DriverErrors } from '../../drivers/types/driver-errors.js';
import { toPaymentResponse, toRideResponse } from '../types/ride.types.js';
import type { ride_status } from '@db/queries/rides/rides.queries.js';
import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';

const CANCELLABLE_STATUSES: ride_status[] = [
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'PENDING_ASSIGNMENT',
  'DRIVER_ASSIGNED',
  'CONFIRMED',
];

@Injectable()
export class AdminRideService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rideRepository: RideRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly cancellationRepository: RideCancellationRepository,
    private readonly profileRepository: DriverProfileRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly userRepository: UserRepository,
    private readonly rideBookingService: RideBookingService,
    private readonly statusService: RideStatusService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async listRides(
    status: ride_status | undefined,
    category: vehicle_category | undefined,
    limit = 20,
    offset = 0,
  ) {
    const rides = await this.rideRepository.listAdmin(status ?? null, category ?? null, limit, offset);
    return { rides: rides.map(toRideResponse) };
  }

  async getRideDetail(rideId: string) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }

    const detail = await this.rideBookingService.buildRideDetail(ride);
    const booker = await this.userRepository.findById(ride.booked_by_user_id);

    return {
      ...detail,
      booker: booker
        ? {
            id: booker.id,
            email: booker.email,
            full_name: booker.full_name,
            phone_number: booker.phone_number,
          }
        : null,
    };
  }

  async assignRide(rideId: string, adminId: string, dto: AssignRideDto) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }
    if (ride.status !== 'PENDING_ASSIGNMENT') {
      throw RideErrors.notAssignable();
    }

    const profile = await this.profileRepository.findById(dto.driver_profile_id);
    if (!profile || profile.status !== 'APPROVED') {
      throw RideErrors.driverNotAssignable();
    }

    const vehicle = await this.vehicleRepository.findById(dto.vehicle_id);
    if (!vehicle || vehicle.driver_profile_id !== dto.driver_profile_id) {
      throw DriverErrors.vehicleNotFound();
    }
    if (vehicle.vehicle_type !== ride.requested_vehicle_category) {
      throw RideErrors.vehicleCategoryMismatch();
    }

    const updated = await this.databaseService.withTransaction(async (client) => {
      const assigned = await this.rideRepository.assign(
        rideId,
        dto.driver_profile_id,
        dto.vehicle_id,
        adminId,
        client,
      );
      if (!assigned) {
        throw RideErrors.rideNotFound();
      }

      await this.statusService.recordTransition(
        rideId,
        ride.status,
        'DRIVER_ASSIGNED',
        adminId,
        'Driver and vehicle assigned',
        client,
      );

      return assigned;
    });

    return this.rideBookingService.buildRideDetail(updated);
  }

  async cancelRide(rideId: string, adminId: string, dto: CancelRideDto) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }
    if (!CANCELLABLE_STATUSES.includes(ride.status)) {
      throw RideErrors.rideNotCancellable();
    }

    const payments = await this.paymentRepository.listByRideId(rideId);
    const paidOnline = payments.filter(
      (p) => p.payment_type === 'ONLINE' && p.status === 'PAID' && p.provider_payment_id,
    );
    const refundRequired = dto.refund_required ?? paidOnline.length > 0;

    await this.databaseService.withTransaction(async (client) => {
      await this.cancellationRepository.create(
        rideId,
        adminId,
        dto.reason ?? null,
        refundRequired,
        client,
      );

      await this.rideRepository.cancel(rideId, adminId, dto.reason ?? null, client);

      await this.statusService.recordTransition(
        rideId,
        ride.status,
        'CANCELLED',
        adminId,
        dto.reason ?? 'Ride cancelled by admin',
        client,
      );
    });

    if (refundRequired && this.razorpayService.isConfigured()) {
      for (const payment of paidOnline) {
        if (payment.provider_payment_id) {
          await this.razorpayService.createRefund(
            payment.provider_payment_id,
            Number(payment.amount),
          );
          await this.paymentRepository.markRefunded(payment.id, 'REFUNDED');
        }
      }
    }

    const updated = await this.rideRepository.findById(rideId);
    if (!updated) {
      throw RideErrors.rideNotFound();
    }
    return this.rideBookingService.buildRideDetail(updated);
  }

  async updateStatus(rideId: string, adminId: string, dto: UpdateRideStatusDto) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }

    this.statusService.assertTransition(ride.status, dto.status);

    const updated = await this.databaseService.withTransaction(async (client) => {
      const row = await this.rideRepository.updateStatus(rideId, dto.status, client);
      if (!row) {
        throw RideErrors.rideNotFound();
      }

      await this.statusService.recordTransition(
        rideId,
        ride.status,
        dto.status,
        adminId,
        `Status updated to ${dto.status}`,
        client,
      );

      return row;
    });

    return this.rideBookingService.buildRideDetail(updated);
  }

  async markOfflinePaid(rideId: string, paymentId: string) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment || payment.ride_id !== rideId) {
      throw RideErrors.paymentNotFound();
    }
    if (payment.payment_type !== 'OFFLINE') {
      throw RideErrors.paymentNotPending();
    }

    const updated = await this.paymentRepository.markOfflinePaid(paymentId);
    return { payment: updated ? toPaymentResponse(updated) : null };
  }
}
