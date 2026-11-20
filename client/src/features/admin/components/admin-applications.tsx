"use client";
import { useAdminParams } from "../hooks/use-admin-params";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import type { AdminReportingControllerApplicationsApiArg } from "@/store/api/generated/api";
import { indianTime } from "@/features/booking/components/booking-shared";
import {
  AdminHeading,
  AdminTable,
  Pagination,
  QueryStatus,
  readable,
  StatusBadge,
} from "./admin-shared";
// Application state is derived by the backend; correction requests are a review view.
type ReviewState = AdminReportingControllerApplicationsApiArg["state"];
export function AdminApplications({
  verification = false,
}: {
  verification?: boolean;
}) {
  const { params, offset, update } = useAdminParams();
  const states: ReviewState[] = [
    "PENDING_VERIFICATION",
    "REJECTED",
    "CORRECTION_REQUESTED",
    "APPROVED",
    "DRAFT",
  ];
  const state = states.find((value) => value === params.get("state"));
  const search = params.get("search") ?? "";
  const setOffset = (value: number) => update({ offset: value });
  const query = api.useAdminReportingControllerApplicationsQuery(
    { state, search: search || undefined, offset, limit: 20 },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title={verification ? "Verifications" : "Drivers"}
        intro={
          verification
            ? "Review submitted applications and requested document corrections."
            : "Browse driver applications and manage eligibility from driver details."
        }
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <div className="admin-tabs" aria-label="Application views">
        {(
          [
            ["All", undefined],
            ["Pending", "PENDING_VERIFICATION"],
            ["Rejected", "REJECTED"],
            ["Corrections requested", "CORRECTION_REQUESTED"],
            ["Approved", "APPROVED"],
            ["Drafts", "DRAFT"],
          ] as const
        ).map(([label, value]) => (
          <button
            key={label}
            aria-pressed={state === value}
            onClick={() => {
              update({ state: value, offset: 0 });
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          update({
            search: String(new FormData(e.currentTarget).get("search") ?? ""),
            offset: 0,
          });
        }}
      >
        <label>
          Name or email
          <input
            key={search}
            name="search"
            defaultValue={search}
            maxLength={100}
          />
        </label>
        <button type="submit">Search</button>
      </form>
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
              "Driver",
              "Application",
              "Profile status",
              "Submitted",
              "Review",
            ]}
          >
            {page.items.map((app) => (
              <tr key={app.id}>
                <td>
                  {app.full_name}
                  <small>{app.email ?? "—"}</small>
                </td>
                <td>
                  <StatusBadge status={app.review_state} />
                </td>
                <td>{readable(app.profile_status)}</td>
                <td>
                  {app.submitted_at
                    ? indianTime(app.submitted_at)
                    : "Not submitted"}
                </td>
                <td>
                  <Link href={`/admin/drivers/${app.id}`}>
                    View application →
                  </Link>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination
            total={page.total}
            offset={offset}
            onChange={setOffset}
            busy={query.isFetching}
          />
        </>
      )}
    </section>
  );
}
