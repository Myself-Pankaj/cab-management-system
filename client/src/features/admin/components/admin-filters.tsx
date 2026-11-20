"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { readable } from "@/components/shared/record-details";

const names: Record<string, string> = {
  search: "Search", status: "Status", role: "Role", accountStatus: "Account",
  category: "Category", paymentType: "Payment", dateFrom: "From", dateTo: "Until",
  state: "Review", activity: "Vehicle activity", view: "View", reviewState: "Review", eligibility: "Eligibility",
};

export function AdminFilters() {
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = [...params.entries()].filter(([key, value]) => names[key] && value);
  if (!filters.length) return null;
  return <div className="ui-active-filters" aria-label="Active filters">
    {filters.map(([key, value]) => <span key={key}>{names[key]}: {key === "search" || key.startsWith("date") ? value : readable(value)}</span>)}
    <Link href={pathname} scroll={false}>Clear filters</Link>
  </div>;
}
