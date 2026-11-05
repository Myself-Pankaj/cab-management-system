import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RidePassengerRepository } from '../repositories/ride-passenger.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import { RideStatusHistoryRepository } from '../repositories/ride-status-history.repository.js';
import type { CreateRideDto } from '../dto/ride.dto.js';
import { FareCalculatorService } from './fare-calculator.service.js';
import { PaymentSummaryService } from './payment-summary.service.js';
import { PassengerValidationService } from './passenger-validation.service.js';
import { RideQuoteService } from './ride-quote.service.js';
import { RideStatusService } from './ride-status.service.js';
import { RazorpayService } from './razorpay.service.js';
import { RideErrors } from '../types/ride-errors.js';
import {
  toPaymentResponse,
  toRidePassengerResponse,
  toRideResponse,
  toStatusHistoryResponse,
} from '../types/ride.types.js';
import type { IGetRideByIdResult } from '@db/queries/rides/rides.queries.js';
import type { ride_status } from '@db/queries/rides/rides.queries.js';

@Injectable()
export class RideBookingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rideRepository: RideRepository,
    private readonly passengerRepository: RidePassengerRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly historyRepository: RideStatusHistoryRepository,
    private readonly rideQuoteService: RideQuoteService,
    private readonly fareCalculator: FareCalculatorService,
    private readonly statusService: RideStatusService,
    private readonly paymentSummaryService: PaymentSummaryService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async createRide(bookedByUserId: string, dto: CreateRideDto) {
    const quote = await this.rideQuoteService.quote(dto);
    const estimatedFare = quote.fare_breakdown.estimated_fare_inr;

    const initialStatus: ride_status =
      dto.payment_option === 'OFFLINE' ? 'PENDING_ASSIGNMENT' : 'PENDING_PAYMENT';

    const ride = await this.databaseService.withTransaction(async (client) => {
      const created = await this.rideRepository.create(
        {
          bookedByUserId,
          requestedVehicleCategory: dto.vehicle_category,
          passengerCount: dto.passengers.length,
          tripType: dto.trip_type,
          pickupAddress: dto.pickup_address,
          pickupExactLocation: dto.pickup_exact_location ?? null,
          pickupLatitude: dto.pickup_latitude,
          pickupLongitude: dto.pickup_longitude,
          destinationAddress: dto.destination_address,
          exactDestination: dto.exact_destination ?? null,
          destinationLatitude: dto.destination_latitude,
          destinationLongitude: dto.destination_longitude,
          distanceKm: quote.distance_km,
          estimatedDurationMinutes: quote.estimated_duration_minutes,
          pickupAt: new Date(dto.pickup_at),
          returnAt: dto.return_at ? new Date(dto.return_at) : null,
          estimatedFare,
          paymentOption: dto.payment_option,
          status: initialStatus,
        },
        client,
      );

      for (const passenger of dto.passengers) {
        await this.passengerRepository.create(
          created.id,
          passenger.name.trim(),
          passenger.phone.trim(),
          passenger.is_primary ?? false,
          client,
        );
      }

      await this.statusService.recordTransition(
        created.id,
        null,
        initialStatus,
        bookedByUserId,
        'Ride created',
        client,
      );

      if (dto.payment_option === 'ONLINE') {
        await this.paymentRepository.create(
          {
            rideId: created.id,
            userId: bookedByUserId,
            paymentType: 'ONLINE',
            amount: estimatedFare,
            currency: 'INR',
            provider: null,
            providerOrderId: null,
            status: 'CREATED',
          },
          client,
        );
      } else if (dto.payment_option === 'OFFLINE') {
        await this.paymentRepository.create(
          {
            rideId: created.id,
            userId: bookedByUserId,
            paymentType: 'OFFLINE',
            amount: estimatedFare,
            currency: 'INR',
            provider: null,
            providerOrderId: null,
            status: 'PENDING',
          },
          client,
        );
      } else {
        const { advance, remainder } = this.fareCalculator.splitPartialPayment(estimatedFare);
        await this.paymentRepository.create(
          {
            rideId: created.id,
            userId: bookedByUserId,
            paymentType: 'ONLINE',
            amount: advance,
            currency: 'INR',
            provider: null,
            providerOrderId: null,
            status: 'CREATED',
          },
          client,
        );
        await this.paymentRepository.create(
          {
            rideId: created.id,
            userId: bookedByUserId,
            paymentType: 'OFFLINE',
            amount: remainder,
            currency: 'INR',
            provider: null,
            providerOrderId: null,
            status: 'CREATED',
          },
          client,
        );
      }

      return created;
    });

    return this.buildRideDetail(ride);
  }

  async listMyRides(
    bookedByUserId: string,
    status: ride_status | undefined,
    limit = 20,
    offset = 0,
  ) {
    const rides = await this.rideRepository.listByBooker(
      bookedByUserId,
      status ?? null,
      limit,
      offset,
    );
    return { rides: rides.map(toRideResponse) };
  }

  async getRideDetailForBooker(bookedByUserId: string, rideId: string) {
    const ride = await this.rideRepository.findByIdForBooker(rideId, bookedByUserId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }
    return this.buildRideDetail(ride);
  }

  async payOnline(bookedByUserId: string, rideId: string) {
    const ride = await this.rideRepository.findByIdForBooker(rideId, bookedByUserId);
    if (!ride) {
      throw RideErrors.rideNotFound();
    }

    if (ride.status !== 'PENDING_PAYMENT' && ride.status !== 'PAYMENT_FAILED') {
      throw RideErrors.paymentNotPending();
    }

    const payments = await this.paymentRepository.listByRideId(rideId);
    const pendingOnline = payments.find(
      (p) =>
        p.payment_type === 'ONLINE' &&
        (p.status === 'CREATED' || p.status === 'PENDING' || p.status === 'FAILED'),
    );
    if (!pendingOnline) {
      throw RideErrors.paymentNotPending();
    }

    const order = await this.razorpayService.createOrder(
      Number(pendingOnline.amount),
      `ride_${rideId}_${pendingOnline.id}`,
    );

    const updated = await this.paymentRepository.updateProviderOrder(
      pendingOnline.id,
      'razorpay',
      order.id,
      'PENDING',
    );

    return {
      ride_id: rideId,
      payment: updated ? toPaymentResponse(updated) : null,
      razorpay: {
        key_id: this.razorpayService.getKeyId(),
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
  }

  async buildRideDetail(ride: IGetRideByIdResult) {
    const [passengers, payments, history] = await Promise.all([
      this.passengerRepository.listByRideId(ride.id),
      this.paymentRepository.listByRideId(ride.id),
      this.historyRepository.listByRideId(ride.id),
    ]);

    const paymentSummary = this.paymentSummaryService.summarize(
      Number(ride.estimated_fare),
      payments,
    );

    return {
      ride: toRideResponse(ride),
      passengers: passengers.map(toRidePassengerResponse),
      payments: payments.map(toPaymentResponse),
      payment_summary: paymentSummary,
      status_history: history.map(toStatusHistoryResponse),
    };
  }
}
