import { registerAs } from '@nestjs/config';
import { RazorpayConfig } from './config.interface.js';

export default registerAs(
  'razorpay',
  (): RazorpayConfig => ({
    keyId: process.env['RAZORPAY_KEY_ID'] ?? '',
    keySecret: process.env['RAZORPAY_KEY_SECRET'] ?? '',
    webhookSecret: process.env['RAZORPAY_WEBHOOK_SECRET'] ?? '',
  }),
);
