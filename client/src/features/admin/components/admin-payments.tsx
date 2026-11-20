"use client";
import { useState } from "react";
import { useAdminParams } from "../hooks/use-admin-params";
import Link from "next/link";
import { MetricCard } from "@/components/shared/metric-card";
import { api } from "@/store/api/enhanced-api";
import {
  indianTime,
  money,
} from "@/features/booking/components/booking-shared";
import {
  AdminHeading,
  AdminTable,
  Pagination,
  QueryStatus,
  readable,
  StatusBadge,
} from "./admin-shared";
export function AdminPayments() {
  const { params, offset, update } = useAdminParams();
  const status = (
    [
      "CREATED",
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
      "CANCELLED",
    ] as const
  ).find((value) => value === params.get("status"));
  const paymentType = (["ONLINE", "OFFLINE"] as const).find(
    (value) => value === params.get("paymentType"),
  );
  const validDate = (key: string) => {
    const value = params.get(key);
    return value &&
      /^\d{4}-\d{2}-\d{2}T/.test(value) &&
      Number.isFinite(Date.parse(value))
      ? value
      : undefined;
  };
  const dates = {
    dateFrom: validDate("dateFrom"),
    dateTo: validDate("dateTo"),
  };
  const [dateError, setDateError] = useState("");
  const setOffset = (value: number) => update({ offset: value });
  const query = api.useAdminReportingControllerPaymentsQuery(
    { status, paymentType, ...dates, limit: 20, offset },
    { refetchOnFocus: true },
  );
  const page = query.currentData?.data;
  return (
    <section>
      <AdminHeading
        title="Payments"
        intro="Track collections, failed attempts, and refund statuses. Transactions are read-only."
        refresh={() => query.refetch()}
        busy={query.isFetching}
      />
      <form
        className="admin-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            from = String(f.get("from") ?? ""),
            to = String(f.get("to") ?? "");
          if (from && to && from >= to) {
            setDateError("End date must follow start date.");
            return;
          }
          setDateError("");
          update({
            offset: 0,
            dateFrom: from
              ? new Date(`${from}T00:00:00+05:30`).toISOString()
              : undefined,
            dateTo: to
              ? new Date(`${to}T00:00:00+05:30`).toISOString()
              : undefined,
          });
        }}
      >
        <label>
          Status
          <select
            value={status ?? ""}
            onChange={(e) => {
              update({ status: e.target.value, offset: 0 });
            }}
          >
            <option value="">All statuses</option>
            {[
              "CREATED",
              "PENDING",
              "PAID",
              "FAILED",
              "REFUNDED",
              "PARTIALLY_REFUNDED",
              "CANCELLED",
            ].map((s) => (
              <option key={s} value={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={paymentType ?? ""}
            onChange={(e) => {
              update({ paymentType: e.target.value, offset: 0 });
            }}
          >
            <option value="">All types</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Cash</option>
          </select>
        </label>
        <label>
          Created from (IST)
          <input
            key={dates.dateFrom}
            type="date"
            name="from"
            defaultValue={
              dates.dateFrom
                ? new Date(new Date(dates.dateFrom).getTime() + 19800000)
                  .toISOString()
                  .slice(0, 10)
                : ""
            }
          />
        </label>
        <label>
          Before (IST, exclusive)
          <input
            key={dates.dateTo}
            type="date"
            name="to"
            defaultValue={
              dates.dateTo
                ? new Date(new Date(dates.dateTo).getTime() + 19800000)
                  .toISOString()
                  .slice(0, 10)
                : ""
            }
          />
        </label>
        <button type="submit">Apply dates</button>
      </form>
      {dateError && <p role="alert">{dateError}</p>}
      <QueryStatus
        error={query.error}
        loading={query.isLoading}
        empty={page?.items.length === 0}
        retry={() => query.refetch()}
      />
      {page && (
        <>
          <p className="admin-muted">
            Totals reflect all matching transactions across pages. Collected
            amounts include PAID records only.
          </p>
          <div className="admin-metrics">
            {[
              ["Online collected", money(page.summary.online_collected)],
              ["Cash collected", money(page.summary.cash_collected)],
              ["Successful transactions", page.summary.successful],
              ["Failed attempts", page.summary.failed],
              ["Refunded transactions", page.summary.refunded],
              ["Partially refunded", page.summary.partially_refunded],
            ].map(([label, value]) => (
              <MetricCard key={label} label={String(label)} value={value} detail="For the current filters" />
            ))}
          </div>
          <AdminTable
            headings={[
              "Transaction / ride",
              "User",
              "Amount",
              "Type",
              "Status",
              "Created",
            ]}
          >
            {page.items.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/payments/${p.id}`}>{p.id}</Link>
                  <small>
                    <Link href={`/admin/rides/${p.ride_id}`}>View ride →</Link>
                  </small>
                </td>
                <td>
                  <Link href={`/admin/users/${p.user_id}`}>{p.user_name}</Link>
                </td>
                <td>{money(p.amount)}</td>
                <td>
                  {p.payment_type === "OFFLINE" ? "Cash" : "Online"}
                  <small>{p.payment_method ?? p.provider ?? "—"}</small>
                </td>
                <td>
                  <StatusBadge status={p.status} />
                  {p.paid_at && <small>Paid {indianTime(p.paid_at)}</small>}
                  {p.failed_at && (
                    <small>Failed {indianTime(p.failed_at)}</small>
                  )}
                </td>
                <td>{indianTime(p.created_at)}</td>
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
