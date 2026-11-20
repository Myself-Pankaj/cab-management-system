import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminUsers } from "@/features/admin/components/admin-users";
export default function Page() {
  return (
    <AccessGate role="Admin">
      <AdminUsers />
    </AccessGate>
  );
}
