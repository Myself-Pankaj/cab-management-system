import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminApplications } from "@/features/admin/components/admin-applications";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <AdminApplications verification />
    </AccessGate>
  );
}
