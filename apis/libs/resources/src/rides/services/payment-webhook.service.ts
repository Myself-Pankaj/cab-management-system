import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { DatabaseService } from '@app/core';
import { PaymentRepository } from '../repositories/payment.repository.js';
import { RideRepository } from '../repositories/ride.repository.js';
import { RideStatusService } from './ride-status.service.js';
import { RazorpayService } from './razorpay.service.js';
interface PaymentEntity {
  id?: string;
  order_id?: string;
  method?: string;
  amount?: number;
  currency?: string;
  status?: string;
}
interface WebhookPayload {
  event?: string;
  payload?: { payment?: { entity?: PaymentEntity } };
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

  async handleWebhook(rawBody: string, signature: string, eventId?: string) {
    this.razorpayService.verifyWebhookSignature(rawBody, signature);
    const payload = JSON.parse(rawBody) as WebhookPayload;
    const key = eventId || createHash('sha256').update(rawBody).digest('hex');
    return this.databaseService.withTransaction(
      async (client) => {
        const inserted = await this.paymentRepository.insertWebhookEvent(
          key,
          rawBody,
          client,
        );
        if (!inserted) return { processed: false, reason: 'duplicate_event' };
        const entity = payload.payload?.payment?.entity;
        if (
          entity?.order_id &&
          (payload.event === 'payment.captured' ||
            payload.event === 'payment.failed')
        ) {
          await this.applyPayment(
            entity,
            payload.event === 'payment.captured',
            client,
          );
        }
        return { processed: true, event: payload.event };
      },
      { name: 'payment.webhook' },
    );
  }

  async confirmPayment(entity: PaymentEntity) {
    return this.databaseService.withTransaction(
      (client) => this.applyPayment(entity, true, client),
      { name: 'payment.verify' },
    );
  }

  private async applyPayment(
    entity: PaymentEntity,
    captured: boolean,
    client: PoolClient,
  ) {
    if (!entity.order_id || !entity.id)
      throw new BadRequestException('Invalid payment');
    const initial = await this.paymentRepository.findByProviderOrderId(
      entity.order_id,
      client,
    );
    if (!initial) throw new BadRequestException('Payment order not found');
    // Always lock ride before payment to share lock order with checkout order creation.
    await client.query('SELECT id FROM rides WHERE id=$1 FOR UPDATE', [
      initial.ride_id,
    ]);
    const payment = await this.paymentRepository.findByProviderOrderId(
      entity.order_id,
      client,
    );
    const ride = await this.rideRepository.findById(initial.ride_id, client);
    if (!payment || !ride || payment.status === 'PAID') return;
    if (!['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(ride.status)) return;
    if (captured) {
      if (
        entity.amount !== Math.round(Number(payment.amount) * 100) ||
        entity.currency !== payment.currency
      )
        throw new BadRequestException(
          'Payment amount or currency does not match booking',
        );
      await this.paymentRepository.markPaid(
        payment.id,
        entity.id,
        entity.method ?? null,
        client,
      );
      await this.rideRepository.updateStatus(
        ride.id,
        'PENDING_ASSIGNMENT',
        client,
      );
      await this.statusService.recordTransition(
        ride.id,
        ride.status,
        'PENDING_ASSIGNMENT',
        null,
        'Online payment captured',
        client,
      );
    } else if (payment.status !== 'FAILED') {
      await this.paymentRepository.markFailed(payment.id, client);
      await this.rideRepository.updateStatus(ride.id, 'PAYMENT_FAILED', client);
      if (ride.status !== 'PAYMENT_FAILED')
        await this.statusService.recordTransition(
          ride.id,
          ride.status,
          'PAYMENT_FAILED',
          null,
          'Online payment failed',
          client,
        );
    }
  }
}
