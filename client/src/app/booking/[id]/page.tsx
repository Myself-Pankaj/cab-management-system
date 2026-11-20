import { Suspense } from "react";
import { AccessGate } from "@/features/booking/components/booking-shared";
import { BookingStatus } from "@/features/booking/components/booking-status";
export const metadata = { title: "Your booking | Safar Cabs" };
async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccessGate>
      <BookingStatus id={id} />
    </AccessGate>
  );
}
export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="booking-empty">Opening your booking…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}
