import { Injectable } from '@nestjs/common';
import type { IListPaymentsByRideIdResult } from '@db/queries/rides/payments.queries.js';
import type { PaymentSummary, PaymentSummaryStatus } from '../types/ride.types.js';

@Injectable()
export class PaymentSummaryService {
  summarize(
    estimatedFare: number,
    payments: IListPaymentsByRideIdResult[],
  ): PaymentSummary {
    const paidAmount = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remaining = Math.max(0, Math.round((estimatedFare - paidAmount) * 100) / 100);

    let summaryStatus: PaymentSummaryStatus = 'UNPAID';
    if (paidAmount <= 0) {
      summaryStatus = 'UNPAID';
    } else if (remaining > 0) {
      summaryStatus = 'PARTIALLY_PAID';
    } else {
      summaryStatus = 'PAID';
    }

    return {
      estimated_fare: estimatedFare,
      paid_amount: Math.round(paidAmount * 100) / 100,
      remaining_amount: remaining,
      summary_status: summaryStatus,
    };
  }
}
