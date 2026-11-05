import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import { RideStatusService } from './ride-status.service.js';
import { RazorpayService } from './razorpay.service.js';
import { RideErrors } from '../types/ride-errors.js';

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
        status?: string;
      };
    };
  };
}

@Injectable()
export class PaymentWebhookService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly paymentRepository: PaymentRepository,
    private readonly rideRepository: RideRepository,
    private readonly statusService: RideStatusService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async handleWebhook(rawBody: string, signature: string) {
    this.razorpayService.verifyWebhookSignature(rawBody, signature);

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const eventId = (JSON.parse(rawBody) as { id?: string }).id ?? payload.event ?? rawBody;

    const inserted = await this.paymentRepository.insertWebhookEvent(
      eventId,
      rawBody,
    );
    if (!inserted) {
      return { processed: false, reason: 'duplicate_event' };
    }

    const event = payload.event;
    if (event === 'payment.captured') {
      await this.handlePaymentCaptured(payload);
    } else if (event === 'payment.failed') {
      await this.handlePaymentFailed(payload);
    }

    return { processed: true, event };
  }

  private async handlePaymentCaptured(payload: RazorpayWebhookPayload) {
    const entity = payload.payload?.payment?.entity;
    if (!entity?.order_id || !entity.id) {
      return;
    }

    const payment = await this.paymentRepository.findByProviderOrderId(entity.order_id);
    if (!payment || payment.status === 'PAID') {
      return;
    }

    const ride = await this.rideRepository.findById(payment.ride_id);
    if (!ride) {
      return;
    }

    await this.databaseService.withTransaction(async (client) => {
      await this.paymentRepository.markPaid(
        payment.id,
        entity.id,
        entity.method ?? null,
        client,
      );

      if (ride.status === 'PENDING_PAYMENT' || ride.status === 'PAYMENT_FAILED') {
        await this.rideRepository.updateStatus(ride.id, 'PENDING_ASSIGNMENT', client);
        await this.statusService.recordTransition(
          ride.id,
          ride.status,
          'PENDING_ASSIGNMENT',
          null,
          'Online payment captured',
          client,
        );
      }
    });
  }

  private async handlePaymentFailed(payload: RazorpayWebhookPayload) {
    const entity = payload.payload?.payment?.entity;
    if (!entity?.order_id) {
      return;
    }

    const payment = await this.paymentRepository.findByProviderOrderId(entity.order_id);
    if (!payment || payment.status === 'PAID') {
      return;
    }

    const ride = await this.rideRepository.findById(payment.ride_id);
    if (!ride) {
      return;
    }

    await this.databaseService.withTransaction(async (client) => {
      await this.paymentRepository.markFailed(payment.id, client);

      if (ride.status === 'PENDING_PAYMENT') {
        await this.rideRepository.updateStatus(ride.id, 'PAYMENT_FAILED', client);
        await this.statusService.recordTransition(
          ride.id,
          ride.status,
          'PAYMENT_FAILED',
          null,
          'Online payment failed',
          client,
        );
      }
    });
  }
}
