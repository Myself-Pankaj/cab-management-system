import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createHmac } from 'node:crypto';
import { PaymentWebhookService } from '../../libs/resources/src/rides/services/payment-webhook.service.js';

describe('PaymentWebhookService', () => {
  const databaseService = {
    withTransaction: vi.fn(async (work: (client: unknown) => Promise<unknown>) =>
      work({}),
    ),
  };
  const paymentRepository = {
    insertWebhookEvent: vi.fn(),
    findByProviderOrderId: vi.fn(),
    markPaid: vi.fn(),
  };
  const rideRepository = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
  const statusService = { recordTransition: vi.fn() };
  const razorpayService = {
    verifyWebhookSignature: vi.fn(),
  };

  let service: PaymentWebhookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PaymentWebhookService(
      databaseService as never,
      paymentRepository as never,
      rideRepository as never,
      statusService as never,
      razorpayService as never,
    );
  });

  it('ignores duplicate webhook events', async () => {
    razorpayService.verifyWebhookSignature.mockImplementation(() => undefined);
    paymentRepository.insertWebhookEvent.mockResolvedValue(null);

    const payload = JSON.stringify({ event: 'payment.captured', id: 'evt_1' });
    const result = await service.handleWebhook(payload, 'sig');

    expect(result).toEqual({ processed: false, reason: 'duplicate_event' });
  });

  it('marks payment paid and advances ride on capture', async () => {
    razorpayService.verifyWebhookSignature.mockImplementation(() => undefined);
    paymentRepository.insertWebhookEvent.mockResolvedValue({ event_id: 'evt_2' });
    paymentRepository.findByProviderOrderId.mockResolvedValue({
      id: 'pay-1',
      ride_id: 'ride-1',
      status: 'PENDING',
    });
    rideRepository.findById.mockResolvedValue({
      id: 'ride-1',
      status: 'PENDING_PAYMENT',
    });

    const payload = JSON.stringify({
      id: 'evt_2',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'rzp_pay_1',
            order_id: 'order_1',
            method: 'upi',
          },
        },
      },
    });

    const result = await service.handleWebhook(payload, 'sig');

    expect(result.processed).toBe(true);
    expect(paymentRepository.markPaid).toHaveBeenCalledWith(
      'pay-1',
      'rzp_pay_1',
      'upi',
      expect.anything(),
    );
  });
});

describe('RazorpayService signature verification', () => {
  it('verifies webhook HMAC', async () => {
    const { RazorpayService } = await import(
      '../../libs/resources/src/rides/services/razorpay.service.js'
    );
    const config = {
      razorpay: {
        keyId: 'key',
        keySecret: 'secret',
        webhookSecret: 'whsec_test',
      },
    };
    const service = new RazorpayService(config as never);
    const body = '{"event":"payment.captured"}';
    const signature = createHmac('sha256', 'whsec_test').update(body).digest('hex');

    expect(() => service.verifyWebhookSignature(body, signature)).not.toThrow();
  });
});
