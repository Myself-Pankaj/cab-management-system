"use client";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import {
  indianTime,
  money,
} from "@/features/booking/components/booking-shared";
import {
  AdminHeading,
  DetailFields,
  QueryStatus,
  StatusBadge,
} from "./admin-shared";
export function AdminPaymentDetail({ id }: { id: string }) {
  const query = api.useAdminReportingControllerPaymentQuery(
    { id },
    { refetchOnFocus: true },
  );
  const detail = query.currentData?.data,
    payment = detail?.payment,
    summary = detail?.payment_summary;
  return (
    <section>
      <AdminHeading
        title="Transaction details"
        intro="Payment records and the server-calculated ride collection balance."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <Link href="/admin/payments">← All payments</Link>
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        retry={() => query.refetch()}
      />
      {payment && summary && (
        <>
          <div className="admin-detail-grid">
            <article className="admin-panel">
              <h2>Transaction</h2>
              <DetailFields
                items={{
                  Amount: `${money(payment.amount)} ${payment.currency}`,
                  Status: <StatusBadge status={payment.status} />,
                  Type: payment.payment_type === "OFFLINE" ? "Cash" : "Online",
                  Method: payment.payment_method,
                  Provider: payment.provider,
                  "Transaction ID": payment.id,
                  "Provider order": payment.provider_order_id,
                  "Provider payment": payment.provider_payment_id,
                  Created: indianTime(payment.created_at),
                  Paid: payment.paid_at ? indianTime(payment.paid_at) : null,
                  Failed: payment.failed_at
                    ? indianTime(payment.failed_at)
                    : null,
                  Customer: (
                    <Link href={`/admin/users/${payment.user_id}`}>
                      {payment.user_name}
                    </Link>
                  ),
                  Ride: (
                    <Link href={`/admin/rides/${payment.ride_id}`}>
                      View journey →
                    </Link>
                  ),
                }}
              />
            </article>
            <article className="admin-panel admin-financial">
              <h2>Ride payment summary</h2>
              <DetailFields
                items={{
                  Fare: money(summary.estimated_fare),
                  "PAID records": money(summary.paid_amount),
                  "Operational balance": money(summary.remaining_amount),
                  Status: <StatusBadge status={summary.summary_status} />,
                }}
              />
              <p className="admin-muted">
                The balance follows the ride collection rules. It is not net
                revenue or an instruction to collect a cancelled booking. Refund
                and partial-refund statuses are separate; exact refund amounts
                are not recorded by this system.
              </p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
