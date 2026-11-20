"use client";
import type { ReactNode } from "react";
import { Button } from "@heroui/react";
import { QueryState } from "@/components/shared/query-state";
import { AdminFilters } from "./admin-filters";
export function AdminHeading({
  title,
  intro,
  refresh,
  busy,
}: {
  title: string;
  intro: string;
  refresh: () => unknown;
  busy?: boolean;
}) {
  return (
    <div className="admin-title">
      <div>
        <p className="admin-eyebrow">Cab Management / Admin</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <AdminFilters />
      </div>
      <Button
        isDisabled={busy}
        onPress={() => {
          refresh();
        }}
      >
        Refresh
      </Button>
    </div>
  );
}
export function QueryStatus({
  error,
  loading,
  empty,
  retry,
}: {
  error: unknown;
  loading: boolean;
  empty?: boolean;
  retry: () => unknown;
}) {
  return <QueryState error={error} loading={loading} empty={empty} retry={retry} />;
}

export { RecordPagination as Pagination } from "@/components/shared/record-pagination";
export function AdminTable({
  headings,
  children,
}: {
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="admin-table-wrap" role="region" aria-label={`${headings[0]} records table`} tabIndex={0}>
      <table className="admin-table">
        <thead>
          <tr>
            {headings.map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export { readable, StatusBadge, DetailFields } from "@/components/shared/record-details";
