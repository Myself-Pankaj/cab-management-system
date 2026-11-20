import { AccessGate } from "@/features/booking/components/booking-shared";
import { DriverManagement } from "@/features/admin/components/driver-management";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <DriverManagement />
    </AccessGate>
  );
}
