import { AccessGate } from "@/features/booking/components/booking-shared";
import { BookingPreview } from "@/features/booking/components/booking-preview";
export const metadata = { title: "Review your journey | Safar Cabs" };
export default function PreviewPage() {
  return (
    <AccessGate>
      <BookingPreview />
    </AccessGate>
  );
}
