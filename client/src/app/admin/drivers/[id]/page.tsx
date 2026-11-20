import { AccessGate } from "@/features/booking/components/booking-shared";
import { DriverReview } from "@/features/admin/components/driver-management";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AccessGate role="Admin">
      <DriverReview id={id} />
    </AccessGate>
  );
}
