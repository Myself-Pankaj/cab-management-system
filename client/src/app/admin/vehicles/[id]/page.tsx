import { Suspense } from "react";
import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminVehicleDetail } from "@/features/admin/components/admin-vehicle-detail";
async function VehicleDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccessGate role="Admin">
      <AdminVehicleDetail id={id} />
    </AccessGate>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <p className="admin-empty" role="status">
          Loading vehicle details…
        </p>
      }
    >
      <VehicleDetails params={params} />
    </Suspense>
  );
}
