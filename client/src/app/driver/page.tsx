import { AccessGate } from "@/features/booking/components/booking-shared";
import { DriverDashboard } from "@/features/drivers/components/dashboard";
export default function Page() {
  return (
    <AccessGate role="Driver">
      <DriverDashboard />
    </AccessGate>
  );
}
