import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminVehicles } from "@/features/admin/components/admin-vehicles";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <AdminVehicles />
    </AccessGate>
  );
}
