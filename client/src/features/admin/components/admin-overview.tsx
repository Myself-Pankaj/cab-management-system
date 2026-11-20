"use client";
import Link from "next/link";
import { MetricCard } from "@/components/shared/metric-card";
import { api } from "@/store/api/enhanced-api";
import { indianTime } from "@/features/booking/components/booking-shared";
import { AdminHeading, QueryStatus, StatusBadge } from "./admin-shared";
export function AdminOverview() {
  const query = api.useAdminReportingControllerSummaryQuery(undefined, {
    refetchOnFocus: true,
  });
  const data = query.currentData?.data;
  const metrics = data
    ? ([
      ["Total rides", data.rides.total, "/admin/rides", "All time"],
      [
        "Today’s rides",
        data.rides.today,
        "/admin/rides",
        "Scheduled today · IST",
      ],
      [
        "Active rides",
        data.rides.active,
        "/admin/rides",
        "Confirmed and in progress",
      ],
      [
        "Completed rides",
        data.rides.completed,
        "/admin/rides?status=COMPLETED",
        "All time",
      ],
      [
        "Drivers",
        data.users.drivers,
        "/admin/users?role=Driver",
        "Registered driver accounts",
      ],
      [
        "Vehicles",
        data.vehicles.total,
        "/admin/vehicles",
        `${data.vehicles.active} active vehicles`,
      ],
      [
        "Passengers",
        data.users.passengers,
        "/admin/users?role=Passenger",
        "Registered passenger accounts",
      ],
      [
        "Pending reviews",
        data.verifications.pending_drivers,
        "/admin/verifications",
        `${data.verifications.pending_documents} pending documents`,
      ],
    ] as const)
    : [];
  return (
    <section>
      <AdminHeading
        title="Operations overview"
        intro="Your fleet, people, and journeys at a glance."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        retry={() => query.refetch()}
      />
      {data && (
        <>
          <div className="admin-metrics">
            {metrics.map(([label, value, href, detail]) => (
              <MetricCard key={label} label={label} value={value.toLocaleString("en-IN")} href={href} detail={detail} />
            ))}
          </div>
          <div className="admin-panels">
            <article className="admin-panel">
              <div className="admin-panel-heading">
                <h2>
                  Recent verifications{" "}
                  <span className="admin-pill">
                    {data.recent_verifications.length}
                  </span>
                </h2>
                <Link href="/admin/verifications">
                  View all verifications →
                </Link>
              </div>
              {data.recent_verifications.length === 0 && (
                <p className="admin-muted">No submitted verifications yet.</p>
              )}
              {data.recent_verifications.map((app) => (
                <Link
                  className="admin-queue"
                  key={app.id}
                  href={`/admin/drivers/${app.id}`}
                >
                  <strong>{app.full_name}</strong>
                  <StatusBadge status={app.review_state} />
                  <small>
                    {app.submitted_at
                      ? `Submitted ${indianTime(app.submitted_at)}`
                      : "Awaiting verification"}
                  </small>
                </Link>
              ))}
            </article>
            <article className="admin-panel">
              <div className="admin-panel-heading">
                <h2>
                  Recent bookings{" "}
                  <span className="admin-pill">
                    {data.recent_bookings.length}
                  </span>
                </h2>
                <Link href="/admin/rides">View all bookings →</Link>
              </div>
              {data.recent_bookings.length === 0 && (
                <p className="admin-muted">No bookings yet.</p>
              )}
              {data.recent_bookings.map((ride) => (
                <Link
                  className="admin-queue"
                  key={ride.id}
                  href={`/admin/rides/${ride.id}`}
                >
                  <strong>
                    {ride.pickup_address} → {ride.destination_address}
                  </strong>
                  <small>
                    {indianTime(ride.pickup_at)} ·{" "}
                    {ride.requested_vehicle_category.replace("SEATER_", "")}{" "}
                    seats
                  </small>
                  <StatusBadge status={ride.status} />
                </Link>
              ))}
            </article>
          </div>
          <div className="admin-panels">
            <article className="admin-panel">
              <h2>Ride activity</h2>
              <div className="admin-breakdown">
                {[
                  [
                    "Unassigned",
                    data.rides.awaiting_assignment,
                    "PENDING_ASSIGNMENT",
                  ],
                  [
                    "Awaiting acceptance",
                    data.rides.awaiting_acceptance,
                    "DRIVER_ASSIGNED",
                  ],
                  ["Confirmed", data.rides.confirmed, "CONFIRMED"],
                  ["Ongoing", data.rides.ongoing, "IN_PROGRESS"],
                  ["Completed", data.rides.completed, "COMPLETED"],
                  ["Cancelled", data.rides.cancelled, "CANCELLED"],
                  [
                    "Pending payment",
                    data.rides.pending_payment,
                    "PENDING_PAYMENT",
                  ],
                  [
                    "Payment failed",
                    data.rides.payment_failed,
                    "PAYMENT_FAILED",
                  ],
                ].map(([label, value, status]) => (
                  <Link href={`/admin/rides?status=${status}`} key={status}>
                    {label} <strong>{value}</strong>
                  </Link>
                ))}
              </div>
              <p className="admin-muted">
                Expired offers appear as awaiting reassignment.
              </p>
            </article>
            <article className="admin-panel">
              <div className="admin-panel-heading">
                <h2>People</h2>
                <Link href="/admin/users">
                  {data.users.total} total users →
                </Link>
              </div>
              {(["drivers", "passengers", "admins", "unselected"] as const).map(
                (role) => (
                  <div className="admin-role-row" key={role}>
                    <span>
                      {role === "unselected"
                        ? "Role unselected"
                        : role[0].toUpperCase() + role.slice(1)}
                    </span>
                    <span>
                      {data.users[role]}{" "}
                      <small className="admin-muted">
                        {" "}
                        · {data.users.percentages[role]}%
                      </small>
                    </span>
                  </div>
                ),
              )}
            </article>
          </div>
          <p className="admin-muted">
            Updated {indianTime(data.calculated_at)} · All-time totals unless
            labelled otherwise. Today follows Asia/Kolkata.
          </p>
        </>
      )}
    </section>
  );
}
