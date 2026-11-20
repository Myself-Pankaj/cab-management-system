"use client";
import { useAdminParams } from "../hooks/use-admin-params";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import {
  AdminHeading,
  AdminTable,
  Pagination,
  QueryStatus,
  readable,
} from "./admin-shared";
export function AdminVehicles() {
  const { params, offset, update } = useAdminParams();
  const search = params.get("search") ?? "";
  const activity = (["active", "inactive"] as const).find(
    (value) => value === params.get("activity"),
  );
  const category = (
    ["SEATER_4", "SEATER_5", "SEATER_7", "SEATER_12"] as const
  ).find((value) => value === params.get("category"));
  const setOffset = (value: number) => update({ offset: value });
  const query = api.useAdminReportingControllerVehiclesQuery(
    { search: search || undefined, activity, category, limit: 20, offset },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title="Vehicles"
        intro="Registered fleet and document review status. Availability depends on the booking time."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
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
          Registration or driver
          <input
            key={search}
            name="search"
            defaultValue={search}
            maxLength={100}
          />
        </label>
        <button type="submit">Search</button>
        <label>
          Activity
          <select
            value={activity ?? ""}
            onChange={(e) => {
              update({ activity: e.target.value, offset: 0 });
            }}
          >
            <option value="">All vehicles</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          Category
          <select
            value={category ?? ""}
            onChange={(e) => {
              update({ category: e.target.value, offset: 0 });
            }}
          >
            <option value="">All categories</option>
            {["SEATER_4", "SEATER_5", "SEATER_7", "SEATER_12"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
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
              "Vehicle",
              "Driver",
              "Category",
              "Activity",
              "Documents / expiry",
            ]}
          >
            {page.items.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link href={`/admin/vehicles/${v.id}`}>
                    {v.vehicle_number}
                  </Link>
                  <small>
                    {v.make} {v.model}
                  </small>
                </td>
                <td>
                  <Link href={`/admin/drivers/${v.driver_profile_id}`}>
                    {v.driver_name}
                  </Link>
                </td>
                <td>{v.vehicle_type ?? "—"}</td>
                <td>{v.is_active ? "Active" : "Inactive"}</td>
                <td>
                  {v.documents.length === 0
                    ? "No documents"
                    : v.documents.map((d) => (
                        <div key={d.id}>
                          {d.document_type} · {readable(d.status)}
                          <small>
                            Expiry:{" "}
                            {d.expiry_date?.slice(0, 10) ?? "Not recorded"}
                          </small>
                        </div>
                      ))}
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
