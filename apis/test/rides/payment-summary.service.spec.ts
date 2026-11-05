import { describe, expect, it } from 'vitest';
import { PaymentSummaryService } from '../../libs/resources/src/rides/services/payment-summary.service.js';

describe('PaymentSummaryService', () => {
  const service = new PaymentSummaryService();

  it('returns UNPAID when no payments are paid', () => {
    const summary = service.summarize(500, [
      {
        id: 'p1',
        ride_id: 'r1',
        user_id: 'u1',
        payment_type: 'ONLINE',
        amount: '500',
        currency: 'INR',
        provider: null,
        provider_order_id: null,
        provider_payment_id: null,
        status: 'CREATED',
        payment_method: null,
        paid_at: null,
        failed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    expect(summary.summary_status).toBe('UNPAID');
    expect(summary.remaining_amount).toBe(500);
  });

  it('returns PARTIALLY_PAID for partial advance', () => {
    const summary = service.summarize(1000, [
      {
        id: 'p1',
        ride_id: 'r1',
        user_id: 'u1',
        payment_type: 'ONLINE',
        amount: '300',
        currency: 'INR',
        provider: 'razorpay',
        provider_order_id: 'order_1',
        provider_payment_id: 'pay_1',
        status: 'PAID',
        payment_method: 'upi',
        paid_at: new Date(),
        failed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'p2',
        ride_id: 'r1',
        user_id: 'u1',
        payment_type: 'OFFLINE',
        amount: '700',
        currency: 'INR',
        provider: null,
        provider_order_id: null,
        provider_payment_id: null,
        status: 'CREATED',
        payment_method: null,
        paid_at: null,
        failed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    expect(summary.summary_status).toBe('PARTIALLY_PAID');
    expect(summary.paid_amount).toBe(300);
    expect(summary.remaining_amount).toBe(700);
  });

  it('returns PAID when total paid meets estimated fare', () => {
    const summary = service.summarize(500, [
      {
        id: 'p1',
        ride_id: 'r1',
        user_id: 'u1',
        payment_type: 'ONLINE',
        amount: '500',
        currency: 'INR',
        provider: 'razorpay',
        provider_order_id: 'order_1',
        provider_payment_id: 'pay_1',
        status: 'PAID',
        payment_method: 'card',
        paid_at: new Date(),
        failed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    expect(summary.summary_status).toBe('PAID');
    expect(summary.remaining_amount).toBe(0);
  });
});
