import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { AppConfigService } from '@app/core';
import { RideErrors } from '../types/ride-errors.js';

@Injectable()
export class RazorpayService {
  private client: Razorpay | null = null;

  constructor(private readonly config: AppConfigService) {}

  private getClient(): Razorpay {
    if (this.client) {
      return this.client;
    }

    const { keyId, keySecret } = this.config.razorpay;
    if (!keyId || !keySecret) {
      throw RideErrors.razorpayNotConfigured();
    }

    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this.client;
  }

  isConfigured(): boolean {
    const { keyId, keySecret, webhookSecret } = this.config.razorpay;
    // Local checkout confirms payments through the authenticated verification API.
    // Deployed environments also need webhooks for interrupted checkout sessions.
    return Boolean(
      keyId && keySecret && (this.config.isDevelopment || webhookSecret),
    );
  }

  getKeyId(): string {
    return this.config.razorpay.keyId;
  }

  async createOrder(amountInr: number, receipt: string) {
    const client = this.getClient();
    const amountPaise = Math.round(amountInr * 100);

    return client.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      payment_capture: true,
    });
  }

  fetchOrder(id: string) {
    return this.getClient().orders.fetch(id);
  }
  fetchPayment(id: string) {
    return this.getClient().payments.fetch(id);
  }
  verifyCheckout(orderId: string, paymentId: string, signature: string) {
    const expected = createHmac('sha256', this.config.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      throw new BadRequestException('Invalid payment signature');
  }

  async createRefund(paymentId: string, amountInr: number) {
    const client = this.getClient();
    const amountPaise = Math.round(amountInr * 100);
    return client.payments.refund(paymentId, { amount: amountPaise });
  }

  verifyWebhookSignature(rawBody: string, signature: string) {
    const secret = this.config.razorpay.webhookSecret;
    if (!secret) {
      throw RideErrors.razorpayNotConfigured();
    }

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw RideErrors.webhookSignatureInvalid();
    }
  }
}
