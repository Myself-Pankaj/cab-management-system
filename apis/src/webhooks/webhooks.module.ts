import { Module } from '@nestjs/common';
import { ResourcesModule } from '@app/resources';
import { RazorpayWebhookController } from './razorpay-webhook.controller.js';

@Module({
  imports: [ResourcesModule],
  controllers: [RazorpayWebhookController],
})
export class AppWebhooksModule {}
