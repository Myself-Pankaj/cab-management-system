import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminOverview } from "@/features/admin/components/admin-overview";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <AdminOverview />
    </AccessGate>
  );
}
