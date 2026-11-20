"use client";
import { useAdminParams } from "../hooks/use-admin-params";
import { RelatedRides } from "./related-rides";
import Link from "next/link";
import { api } from "@/store/api/enhanced-api";
import { indianTime } from "@/features/booking/components/booking-shared";
import {
  AdminHeading,
  AdminTable,
  Pagination,
  QueryStatus,
  StatusBadge,
} from "./admin-shared";
export function AdminUsers() {
  const { params, offset, update } = useAdminParams();
  const role = (["Driver", "Passenger", "Admin", "UNSELECTED"] as const).find(
    (value) => value === params.get("role"),
  );
  const accountStatus = (["ACTIVE", "INACTIVE", "BLOCKED"] as const).find(
    (value) => value === params.get("accountStatus"),
  );
  const search = params.get("search") ?? "";
  const setOffset = (value: number) => update({ offset: value });
  const query = api.useAdminReportingControllerUsersQuery(
    { role, accountStatus, search: search || undefined, offset, limit: 20 },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title="Users"
        intro="Browse registered accounts and their current roles."
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
          Search name, email or phone
          <input
            key={search}
            defaultValue={search}
            name="search"
            placeholder="Search users"
            maxLength={100}
          />
        </label>
        <button type="submit">Search</button>
        <label>
          Role
          <select
            value={role ?? ""}
            onChange={(e) => {
              update({ role: e.target.value, offset: 0 });
            }}
          >
            <option value="">All roles</option>
            {["Driver", "Passenger", "Admin", "UNSELECTED"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Account status
          <select
            value={accountStatus ?? ""}
            onChange={(e) => {
              update({ accountStatus: e.target.value, offset: 0 });
            }}
          >
            <option value="">All accounts</option>
            {["ACTIVE", "INACTIVE", "BLOCKED"].map((s) => (
              <option key={s}>{s}</option>
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
              "User",
              "Contact",
              "Role",
              "Status",
              "Created",
              "Last login",
            ]}
          >
            {page.items.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link href={`/admin/users/${u.id}`}>{u.full_name}</Link>
                </td>
                <td>
                  {u.email ?? "—"}
                  <small>{u.phone_number ?? "—"}</small>
                </td>
                <td>{u.global_role ?? "Unselected"}</td>
                <td>
                  <StatusBadge
                    status={
                      u.is_blocked
                        ? "BLOCKED"
                        : u.is_active
                          ? "ACTIVE"
                          : "INACTIVE"
                    }
                  />
                </td>
                <td>{indianTime(u.created_at)}</td>
                <td>
                  {u.last_login_at
                    ? indianTime(u.last_login_at)
                    : "Never recorded"}
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
export function AdminUserDetail({ id }: { id: string }) {
  const query = api.useAdminReportingControllerUserQuery(
    { id },
    { refetchOnFocus: true },
  );
  const user = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title="User details"
        intro="Account information is read-only."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <Link href="/admin/users">← All users</Link>
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        retry={() => query.refetch()}
      />
      {user && (
        <article className="admin-panel">
          <h2>{user.full_name}</h2>
          <dl>
            {Object.entries({
              Email: user.email,
              Phone: user.phone_number,
              Role: user.global_role ?? "Unselected",
              Status: (
                <StatusBadge
                  status={
                    user.is_blocked
                      ? "BLOCKED"
                      : user.is_active
                        ? "ACTIVE"
                        : "INACTIVE"
                  }
                />
              ),
              Created: indianTime(user.created_at),
              "Last login": user.last_login_at
                ? indianTime(user.last_login_at)
                : "Never recorded",
            }).map(([label, value]) => (
              <div className="admin-role-row" key={label}>
                <dt>{label}</dt>
                <dd>{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </article>
      )}
      {user && <RelatedRides userId={id} />}
    </section>
  );
}
