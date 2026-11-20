import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminPayments } from "@/features/admin/components/admin-payments";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <AdminPayments />
    </AccessGate>
  );
}
