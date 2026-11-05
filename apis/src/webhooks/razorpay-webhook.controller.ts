import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentWebhookService, Public } from '@app/resources';

@ApiTags('Webhooks')
@Controller('webhooks')
export class RazorpayWebhookController {
  constructor(private readonly paymentWebhookService: PaymentWebhookService) {}

  @Public()
  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody =
      req.rawBody?.toString('utf8') ??
      (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    return this.paymentWebhookService.handleWebhook(rawBody, signature ?? '');
  }
}
