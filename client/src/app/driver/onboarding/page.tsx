import { AccessGate } from "@/features/booking/components/booking-shared";
import { DriverOnboarding } from "@/features/drivers/components/onboarding";
export default function Page() {
  return (
    <AccessGate role="Driver">
      <DriverOnboarding />
    </AccessGate>
  );
}
