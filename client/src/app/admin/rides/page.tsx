import { AccessGate } from "@/features/booking/components/booking-shared";
import { RideManagement } from "@/features/admin/components/ride-management";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <RideManagement />
    </AccessGate>
  );
}
