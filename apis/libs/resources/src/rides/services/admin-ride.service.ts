import { adminMutation } from '../../admin/admin-mutation.js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DriverRideService } from './driver-ride.service.js';
import { DriverRideRepository } from '../repositories/driver-ride.repository.js';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { DriverProfileRepository } from '../../drivers/repositories/driver-profile.repository.js';
import { VehicleRepository } from '../../drivers/repositories/vehicle.repository.js';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RideCancellationRepository } from '../repositories/ride-cancellation.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import type {
  AssignRideDto,
  CancelRideDto,
  UpdateRideStatusDto,
} from '../dto/ride.dto.js';
import { RideBookingService } from './ride-booking.service.js';
import { RideStatusService } from './ride-status.service.js';
import { RazorpayService } from './razorpay.service.js';
import { RideErrors } from '../types/ride-errors.js';
import { toRideResponse } from '../types/ride.types.js';
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
    private readonly driverRides: DriverRideService,
    private readonly operations: DriverRideRepository,
  ) {}

  async listRides(
    status: ride_status | undefined,
    category: vehicle_category | undefined,
    limit = 20,
    offset = 0,
  ) {
    const rides = await this.rideRepository.listAdmin(
      status ?? null,
      category ?? null,
      limit,
      offset,
    );
    return { rides: rides.map(toRideResponse) };
  }

  async getRideDetail(rideId: string) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }

    const detail = await this.driverRides.detail(rideId, '', true);
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
    if (!dto.reason?.trim())
      throw new BadRequestException('An assignment reason is required');
    return this.driverRides.assign(
      rideId,
      adminId,
      dto.driver_profile_id,
      dto.vehicle_id,
      { operation_id: dto.operation_id, reason: dto.reason },
    );
  }

  async cancelRide(rideId: string, adminId: string, dto: CancelRideDto) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }
    if (!dto.reason?.trim())
      throw new BadRequestException('A cancellation reason is required');
    let replayed = false;

    const { paidOnline, refundRequired } =
      await this.databaseService.withTransaction((client) =>
        adminMutation(
          client,
          adminId,
          dto.operation_id,
          `cancel:${rideId}`,
          dto,
          async () => {
            if (ride.driver_profile_id && ride.vehicle_id)
              await this.operations.lockResources(
                ride.driver_profile_id,
                ride.vehicle_id,
                client,
              );
            const locked = await this.operations.lockRide(rideId, client);
            if (
              !locked ||
              locked.driver_profile_id !== ride.driver_profile_id ||
              locked.vehicle_id !== ride.vehicle_id ||
              !CANCELLABLE_STATUSES.includes(locked.status)
            )
              throw RideErrors.rideNotCancellable();
            await this.operations.cancelOffers(
              rideId,
              adminId,
              dto.reason ?? null,
              client,
            );
            const payments = await this.paymentRepository.listByRideId(
              rideId,
              client,
            );
            const paidOnline = payments.filter(
              (p) =>
                p.payment_type === 'ONLINE' &&
                p.status === 'PAID' &&
                p.provider_payment_id,
            );
            const refundRequired = dto.refund_required ?? paidOnline.length > 0;
            await this.cancellationRepository.create(
              rideId,
              adminId,
              dto.reason ?? null,
              refundRequired,
              client,
            );

            await this.rideRepository.cancel(
              rideId,
              adminId,
              dto.reason ?? null,
              client,
            );

            await this.statusService.recordTransition(
              rideId,
              locked.status,
              'CANCELLED',
              adminId,
              dto.reason ?? 'Ride cancelled by admin',
              client,
            );
            return { paidOnline, refundRequired };
          },
          () => {
            replayed = true;
          },
        ),
      );

    if (!replayed && refundRequired && this.razorpayService.isConfigured()) {
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

  async updateStatus(
    rideId: string,
    adminId: string,
    dto: UpdateRideStatusDto,
  ) {
    if (dto.status === 'IN_PROGRESS')
      return this.driverRides.start(rideId, adminId, true, dto.reason);
    throw new BadRequestException(
      'Use the dedicated assignment, cancellation, or cash-declaration completion endpoint',
    );
  }

  async markOfflinePaid(_rideId: string, _paymentId: string) {
    throw new BadRequestException(
      'Record cash collection through the ride completion endpoint',
    );
  }
}
