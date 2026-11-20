import type { ReactNode } from "react";
export const readable = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = [
    "APPROVED",
    "ELIGIBLE",
    "PAID",
    "ACTIVE",
    "COMPLETED",
    "CONFIRMED",
    "ACCEPTED",
    "IN_PROGRESS",
  ].includes(status)
    ? "success"
    : [
      "REJECTED",
      "FAILED",
      "PAYMENT_FAILED",
      "SUSPENDED",
      "BLOCKED",
      "CANCELLED",
    ].includes(status)
      ? "danger"
      : [
        "PENDING",
        "PENDING_VERIFICATION",
        "REVIEW_REQUIRED",
        "PENDING_PAYMENT",
        "PENDING_ASSIGNMENT",
        "DRIVER_ASSIGNED",
        "CORRECTION_REQUESTED",
        "PARTIALLY_PAID",
      ].includes(status)
        ? "warning"
        : "neutral";
  return (
    <span className="ui-status" data-tone={tone}>
      {label ?? readable(status)}
    </span>
  );
}
export function DetailFields({
  items,
}: {
  items: Record<string, ReactNode>;
}) {
  return (
    <dl className="ui-details">
      {Object.entries(items).map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value ?? "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}
