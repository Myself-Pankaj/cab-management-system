"use client";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import { vehicleCategoryLabels } from "@/features/booking/booking-labels";
import { useAdminParams } from "../hooks/use-admin-params";
import {
  AdminTable,
  Pagination,
  QueryStatus,
  StatusBadge,
} from "./admin-shared";
import {
  indianTime,
  money,
} from "@/features/booking/components/booking-shared";
export function RelatedRides({
  userId,
  driverProfileId,
}: {
  userId?: string;
  driverProfileId?: string;
}) {
  const { params, update } = useAdminParams();
  const view =
    params.get("ridesView") === "completed" ? "completed" : "assigned";
  const raw = Number(params.get("ridesOffset") ?? 0);
  const offset =
    Number.isInteger(raw) && raw >= 0 && raw <= 2147483647 ? raw : 0;
  const query = api.useAdminRidesControllerListQuery(
    {
      userId,
      driverProfileId,
      view: driverProfileId ? view : undefined,
      offset,
      limit: 20,
    },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section className="admin-section">
      <h2>{driverProfileId ? "Driver rides" : "Booked rides"}</h2>
      {driverProfileId && (
        <div className="admin-tabs">
          {(["assigned", "completed"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={view === value}
              onClick={() => update({ ridesView: value, ridesOffset: 0 })}
            >
              {value === "assigned" ? "Assigned" : "Completed"}
            </button>
          ))}
        </div>
      )}
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
              "Pickup · IST",
              "Requested cab",
              "Status",
              "Fare",
              "Details",
            ]}
          >
            {page.items.map((ride) => (
              <tr key={ride.id}>
                <td>
                  <strong>{ride.pickup_address}</strong>
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
                  <Link href={`/admin/rides/${ride.id}`}>View ride →</Link>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination
            total={page.total}
            offset={offset}
            busy={query.isFetching}
            onChange={(value) => update({ ridesOffset: value })}
          />
        </>
      )}
    </section>
  );
}
