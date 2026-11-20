import type { PoolClient } from 'pg';
import { createHash } from 'node:crypto';
import { PaymentWebhookService } from './payment-webhook.service.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RidePassengerRepository } from '../repositories/ride-passenger.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import { RideStatusHistoryRepository } from '../repositories/ride-status-history.repository.js';
import type { CreateRideDto, VerifyRidePaymentDto } from '../dto/ride.dto.js';
import { FareCalculatorService } from './fare-calculator.service.js';
import { PaymentSummaryService } from './payment-summary.service.js';
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
    private readonly paymentUpdates: PaymentWebhookService,
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
    const payloadHash = createHash('sha256')
      .update(
        JSON.stringify({
          vehicle_category: dto.vehicle_category,
          trip_type: dto.trip_type,
          pickup_address: dto.pickup_address,
          pickup_exact_location: dto.pickup_exact_location?.trim() || null,
          pickup_latitude: dto.pickup_latitude,
          pickup_longitude: dto.pickup_longitude,
          destination_address: dto.destination_address,
          exact_destination: dto.exact_destination?.trim() || null,
          destination_latitude: dto.destination_latitude,
          destination_longitude: dto.destination_longitude,
          pickup_at: dto.pickup_at,
          return_at: dto.return_at ?? null,
          bag_count: dto.bag_count ?? 0,
          special_requests: dto.special_requests?.trim() || null,
          payment_option: dto.payment_option,
          passengers: dto.passengers.map((p) => ({
            name: p.name.trim(),
            phone: p.phone.trim(),
            is_primary: p.is_primary ?? false,
          })),
        }),
      )
      .digest('hex');
    if (dto.booking_key) {
      const existing = await this.rideRepository.findByBookingKey(
        bookedByUserId,
        dto.booking_key,
      );
      if (existing) {
        if (existing.booking_payload_hash !== payloadHash)
          throw new ConflictException(
            'Booking key already used with different details',
          );
        return this.buildRideDetail(existing);
      }
    }
    if (
      dto.payment_option !== 'OFFLINE' &&
      !this.razorpayService.isConfigured()
    )
      throw new ServiceUnavailableException(
        'Online payment is currently unavailable. Choose pay later.',
      );
    const quote = await this.rideQuoteService.quote(dto);
    const estimatedFare = quote.fare_breakdown.estimated_fare_inr;

    if (
      dto.accepted_fare_inr !== undefined &&
      Math.round(dto.accepted_fare_inr * 100) !==
        Math.round(estimatedFare * 100)
    )
      throw RideErrors.fareChanged();

    const initialStatus: ride_status =
      dto.payment_option === 'OFFLINE'
        ? 'PENDING_ASSIGNMENT'
        : 'PENDING_PAYMENT';

    const ride = await this.databaseService.withTransaction(async (client) => {
      if (dto.booking_key) {
        await client.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
          [`${bookedByUserId}:${dto.booking_key}`],
        );
        const existing = await this.rideRepository.findByBookingKey(
          bookedByUserId,
          dto.booking_key,
          client,
        );
        if (existing) {
          if (existing.booking_payload_hash !== payloadHash)
            throw new ConflictException(
              'Booking key already used with different details',
            );
          return existing;
        }
      }
      const created = await this.rideRepository.create(
        {
          bookedByUserId,
          requestedVehicleCategory: dto.vehicle_category,
          passengerCount: dto.passengers.length,
          bagCount: dto.bag_count ?? 0,
          specialRequests: dto.special_requests?.trim() || null,
          bookingKey: dto.booking_key ?? null,
          bookingPayloadHash: dto.booking_key ? payloadHash : null,
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
        const { advance, remainder } =
          this.fareCalculator.splitPartialPayment(estimatedFare);
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
    view?: 'upcoming' | 'completed',
  ) {
    return this.databaseService.withTransaction(
      async (client) => {
        const rides = await this.rideRepository.listByBooker(
          bookedByUserId,
          status ?? null,
          limit,
          offset,
          client,
          view,
        );
        const counts = await this.rideRepository.countByBooker(
          bookedByUserId,
          status ?? null,
          view,
          client,
        );
        return {
          rides: rides.map(toRideResponse),
          total: counts.total ?? 0,
          limit,
          offset,
          counts: {
            upcoming: counts.upcoming ?? 0,
            completed: counts.completed ?? 0,
          },
        };
      },
      {
        name: 'rides.listMine',
        readOnly: true,
        isolationLevel: 'REPEATABLE READ',
      },
    );
  }

  async getRideDetailForBooker(bookedByUserId: string, rideId: string) {
    const ride = await this.rideRepository.findByIdForBooker(
      rideId,
      bookedByUserId,
    );
    if (!ride) {
      throw RideErrors.rideNotFound();
    }
    return this.buildRideDetail(ride);
  }

  async payOnline(bookedByUserId: string, rideId: string) {
    if (!this.razorpayService.isConfigured())
      throw new ServiceUnavailableException(
        'Online payment is currently unavailable.',
      );
    return this.databaseService.withTransaction(
      async (client) => {
        await client.query(
          'SELECT id FROM rides WHERE id=$1 AND booked_by_user_id=$2 FOR UPDATE',
          [rideId, bookedByUserId],
        );
        const ride = await this.rideRepository.findByIdForBooker(
          rideId,
          bookedByUserId,
          client,
        );
        if (!ride) throw RideErrors.rideNotFound();
        if (!['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(ride.status))
          throw RideErrors.paymentNotPending();
        const payments = await this.paymentRepository.listByRideId(
          rideId,
          client,
        );
        const payment = payments.find(
          (p) =>
            p.payment_type === 'ONLINE' &&
            ['CREATED', 'PENDING', 'FAILED'].includes(p.status),
        );
        if (!payment) throw RideErrors.paymentNotPending();
        const order = payment.provider_order_id
          ? await this.razorpayService.fetchOrder(payment.provider_order_id)
          : await this.razorpayService.createOrder(
              Number(payment.amount),
              `ride_${payment.id.replaceAll('-', '')}`,
            );
        if (order.status === 'paid')
          throw new ConflictException(
            'Payment is being confirmed. Refresh booking status.',
          );
        const updated = payment.provider_order_id
          ? payment
          : await this.paymentRepository.updateProviderOrder(
              payment.id,
              'razorpay',
              order.id,
              'PENDING',
              client,
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
      },
      { name: 'payment.order' },
    );
  }

  async verifyPayment(
    userId: string,
    rideId: string,
    dto: VerifyRidePaymentDto,
  ) {
    const ride = await this.rideRepository.findByIdForBooker(rideId, userId);
    if (!ride) throw RideErrors.rideNotFound();
    const payments = await this.paymentRepository.listByRideId(rideId);
    if (
      !payments.some(
        (p) =>
          p.provider_order_id === dto.razorpay_order_id &&
          p.provider === 'razorpay',
      )
    )
      throw new BadRequestException(
        'Payment order does not belong to this booking',
      );
    this.razorpayService.verifyCheckout(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    const payment = await this.razorpayService.fetchPayment(
      dto.razorpay_payment_id,
    );
    if (payment.order_id !== dto.razorpay_order_id)
      throw new BadRequestException('Payment order does not match');
    if (payment.status === 'captured')
      await this.paymentUpdates.confirmPayment({
        id: payment.id,
        order_id: payment.order_id,
        amount: Number(payment.amount),
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
      });
    return this.getRideDetailForBooker(userId, rideId);
  }

  async buildRideDetail(ride: IGetRideByIdResult, client?: PoolClient) {
    const [passengers, payments, history] = client
      ? ([
          await this.passengerRepository.listByRideId(ride.id, client),
          await this.paymentRepository.listByRideId(ride.id, client),
          await this.historyRepository.listByRideId(ride.id, client),
        ] as const)
      : await Promise.all([
          this.passengerRepository.listByRideId(ride.id),
          this.paymentRepository.listByRideId(ride.id),
          this.historyRepository.listByRideId(ride.id),
        ]);

    const paymentSummary = this.paymentSummaryService.summarize(
      Number(ride.final_fare ?? ride.estimated_fare),
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
