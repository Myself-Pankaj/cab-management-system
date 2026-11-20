import { Suspense } from "react";
import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminPaymentDetail } from "@/features/admin/components/admin-payment-detail";
async function PaymentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccessGate role="Admin">
      <AdminPaymentDetail id={id} />
    </AccessGate>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <p className="admin-empty" role="status">
          Loading payment details…
        </p>
      }
    >
      <PaymentDetails params={params} />
    </Suspense>
  );
}
