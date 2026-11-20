import { AccessGate } from "@/features/booking/components/booking-shared";
import { MyBookings } from "@/features/booking/components/my-bookings";
export const metadata = { title: "My bookings | Safar Cabs" };
export default function BookingsPage() {
  return (
    <AccessGate>
      <MyBookings />
    </AccessGate>
  );
}
