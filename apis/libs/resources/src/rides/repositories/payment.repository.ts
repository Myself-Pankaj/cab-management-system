import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { BaseRepository } from '@app/core';
import {
  createPayment,
  getPaymentById,
  getPaymentByProviderOrderId,
  getPaymentByProviderPaymentId,
  insertWebhookEvent,
  listPaymentsByRideId,
  markOfflinePaymentPaid,
  markPaymentFailed,
  markPaymentPaid,
  markPaymentRefunded,
  updatePaymentProviderOrder,
  type ICreatePaymentParams,
  type payment_status,
} from '@db/queries/rides/payments.queries.js';

@Injectable()
export class PaymentRepository extends BaseRepository {
  async create(params: ICreatePaymentParams, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await createPayment.run(params, connection);
    if (!row) throw new Error('Failed to create payment');
    return row;
  }

  async listByRideId(rideId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    return listPaymentsByRideId.run({ rideId }, connection);
  }

  async findById(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getPaymentById.run({ id }, connection);
    return row ?? null;
  }

  async findByProviderOrderId(providerOrderId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getPaymentByProviderOrderId.run({ providerOrderId }, connection);
    return row ?? null;
  }

  async findByProviderPaymentId(providerPaymentId: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await getPaymentByProviderPaymentId.run({ providerPaymentId }, connection);
    return row ?? null;
  }

  async updateProviderOrder(
    id: string,
    provider: string,
    providerOrderId: string,
    status: payment_status,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await updatePaymentProviderOrder.run(
      { id, provider, providerOrderId, status },
      connection,
    );
    return row ?? null;
  }

  async markPaid(
    id: string,
    providerPaymentId: string | null,
    paymentMethod: string | null,
    client?: PoolClient,
  ) {
    const connection = client ?? this.pool;
    const [row] = await markPaymentPaid.run(
      { id, providerPaymentId, paymentMethod },
      connection,
    );
    return row ?? null;
  }

  async markFailed(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await markPaymentFailed.run({ id }, connection);
    return row ?? null;
  }

  async markRefunded(id: string, status: payment_status, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await markPaymentRefunded.run({ id, status }, connection);
    return row ?? null;
  }

  async markOfflinePaid(id: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await markOfflinePaymentPaid.run({ id }, connection);
    return row ?? null;
  }

  async insertWebhookEvent(eventId: string, payload: string, client?: PoolClient) {
    const connection = client ?? this.pool;
    const [row] = await insertWebhookEvent.run({ eventId, payload }, connection);
    return row ?? null;
  }
}
