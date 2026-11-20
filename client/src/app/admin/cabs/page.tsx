import { AccessGate } from "@/features/booking/components/booking-shared";
import { CabCatalog } from "@/features/admin/components/cab-catalog";
export const metadata = { title: "Manage cab categories | Safar Cabs" };
export default function AdminCabsPage() {
  return (
    <AccessGate role="Admin">
      <CabCatalog />
    </AccessGate>
  );
}
