import { Suspense } from "react";
import { AccessGate } from "@/features/booking/components/booking-shared";
import { RideWorkspace } from "@/features/rides/components/ride-workspace";
async function RideDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccessGate role="Admin">
      <RideWorkspace id={id} admin />
    </AccessGate>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <p className="admin-empty" role="status">
          Loading ride details…
        </p>
      }
    >
      <RideDetails params={params} />
    </Suspense>
  );
}
