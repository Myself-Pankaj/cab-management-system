"use client";
import Link from "next/link";
import { useAdminParams } from "../hooks/use-admin-params";
import { api } from "@/store/api/enhanced-api";
import { vehicleCategoryLabels } from "@/features/booking/booking-labels";
import {
  indianTime,
  money,
} from "@/features/booking/components/booking-shared";
import {
  AdminHeading,
  AdminTable,
  Pagination,
  QueryStatus,
  StatusBadge,
} from "./admin-shared";
const tabs = [
  ["All", undefined],
  ["Unassigned", "PENDING_ASSIGNMENT"],
  ["Awaiting acceptance", "DRIVER_ASSIGNED"],
  ["Confirmed", "CONFIRMED"],
  ["Ongoing", "IN_PROGRESS"],
  ["Completed", "COMPLETED"],
  ["Cancelled", "CANCELLED"],
  ["Pending payment", "PENDING_PAYMENT"],
  ["Payment failed", "PAYMENT_FAILED"],
] as const;
export function RideManagement() {
  const { params, offset, update } = useAdminParams();
  const raw = params.get("status");
  const status = tabs.find(([, value]) => value === raw)?.[1];
  const category = (
    ["SEATER_4", "SEATER_5", "SEATER_7", "SEATER_12"] as const
  ).find((value) => value === params.get("category"));
  const query = api.useAdminRidesControllerListQuery(
    { status, category, limit: 20, offset },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title="Ride operations"
        intro="Follow journeys from payment through driver acceptance and completion."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <nav className="admin-tabs" aria-label="Ride views">
        {tabs.map(([label, value]) => (
          <Link
            key={label}
            href={(() => {
              const next = new URLSearchParams(params.toString());
              next.delete("offset");
              if (value) next.set("status", value);
              else next.delete("status");
              return `/admin/rides${next.size ? `?${next}` : ""}`;
            })()}
            aria-current={status === value ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="admin-toolbar">
        <label>
          Requested cab
          <select
            value={category ?? ""}
            onChange={(e) => {
              update({ category: e.target.value, offset: 0 });
            }}
          >
            <option value="">All categories</option>
            {Object.entries(vehicleCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        empty={page?.items.length === 0}
        retry={() => query.refetch()}
      />
      {page && (
        <>
          <AdminTable
            headings={[
              "Journey",
              "Pickup (IST)",
              "Requested cab",
              "Status",
              "Fare",
              "Action",
            ]}
          >
            {page.items.map((ride) => (
              <tr key={ride.id}>
                <td>
                  {ride.pickup_address}
                  <small>→ {ride.destination_address}</small>
                </td>
                <td>{indianTime(ride.pickup_at)}</td>
                <td>
                  {vehicleCategoryLabels[ride.requested_vehicle_category]}
                </td>
                <td>
                  <StatusBadge status={ride.status} />
                </td>
                <td>{money(ride.final_fare ?? ride.estimated_fare)}</td>
                <td>
                  <Link href={`/admin/rides/${ride.id}`}>
                    {ride.status === "PENDING_ASSIGNMENT"
                      ? "Assign driver"
                      : "Manage ride"}{" "}
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination
            total={page.total}
            offset={offset}
            onChange={(offset) => update({ offset })}
            busy={query.isFetching}
          />
        </>
      )}
      <p className="admin-muted">
        Offers awaiting acceptance reserve the driver and vehicle. Expired
        offers appear as unassigned.
      </p>
    </section>
  );
}
