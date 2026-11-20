import { Suspense } from "react";
import { AccessGate } from "@/features/booking/components/booking-shared";
import { AdminUserDetail } from "@/features/admin/components/admin-users";
async function UserDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AccessGate role="Admin">
      <AdminUserDetail id={id} />
    </AccessGate>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <p className="admin-empty" role="status">
          Loading user details…
        </p>
      }
    >
      <UserDetails params={params} />
    </Suspense>
  );
}
