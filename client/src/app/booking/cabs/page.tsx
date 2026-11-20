import { AccessGate } from "@/features/booking/components/booking-shared";
import { CabSelection } from "@/features/booking/components/cab-selection";
export const metadata = { title: "Choose your cab | Safar Cabs" };
export default function CabsPage() {
  return (
    <AccessGate>
      <CabSelection />
    </AccessGate>
  );
}
