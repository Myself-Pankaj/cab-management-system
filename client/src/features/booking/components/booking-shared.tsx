"use client";
import { useEffect, useId, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useSession } from "@/features/auth/hooks/use-session";
import { LoadingSkeleton } from "@/components/shared/query-state";
import { Icon } from "@/components/ui/icon";
import { apiErrorMessage } from "@/features/auth/api-error";
import type { RideEstimateDto } from "@/store/api/generated/api";

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
export const indianTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export const duration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export function AccessGate({
  children,
  role = "Passenger",
}: {
  children: ReactNode;
  role?: "Passenger" | "Admin" | "Driver";
}) {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status === "anonymous") router.replace("/login");
  }, [session.status, router]);
  if (session.error)
    return (
      <div className="booking-empty">
        <h2>Let’s reconnect.</h2>
        <p>{apiErrorMessage(session.error)}</p>
        <Button
          onPress={() => {
            void session.retry();
          }}
        >
          Try again
        </Button>
      </div>
    );
  if (!session.user || session.isChecking || session.status === "anonymous")
    return (
      <div className="booking-page page-width"><LoadingSkeleton label="Opening your journey…" count={2} /></div>
    );
  if (session.user.global_role !== role)
    return (
      <div className="booking-empty">
        <h1>
          This page is for{" "}
          {role === "Admin"
            ? "administrators"
            : role === "Driver"
              ? "drivers"
              : "passengers"}
          .
        </h1>
        <Link href="/">Return home</Link>
      </div>
    );
  return children;
}
export function BookingShell({
  step,
  title,
  intro,
  children,
}: {
  step: number;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="booking-page page-width">
      <nav className="booking-steps" aria-label="Booking progress">
        {["Journey", "Your cab", "Review & book"].map((name, i) => (
          <span key={name} aria-current={step === i + 1 ? "step" : undefined}>
            <b>{String(i + 1).padStart(2, "0")}</b>
            {name}
          </span>
        ))}
      </nav>
      <div className="booking-heading">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      {children}
    </section>
  );
}
export function JourneySummary({
  journey,
  distance,
  minutes,
}: {
  journey: RideEstimateDto;
  distance?: number;
  minutes?: number;
}) {
  return (
    <div className="journey-summary">
      <div>
        <span className="eyebrow">FROM</span>
        <strong>{journey.pickup_address}</strong>
      </div>
      <span aria-hidden="true">→</span>
      <div>
        <span className="eyebrow">TO</span>
        <strong>{journey.destination_address}</strong>
      </div>
      <p>
        {indianTime(journey.pickup_at)} IST ·{" "}
        {journey.trip_type === "ROUND_TRIP" ? "Round trip" : "One way"}
        {journey.return_at && (
          <> · Return {indianTime(journey.return_at)} IST</>
        )}
        {distance !== undefined && <> · {distance} km</>}
        {minutes !== undefined && <> · {duration(minutes)} estimated driving</>}
      </p>
    </div>
  );
}
export function BookingField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  min,
  max,
  pattern,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel" | "url" | "number" | "datetime-local";
  required?: boolean;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  pattern?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <TextField
      id={id}
      aria-labelledby={`${id}-label`}
      className="safar-field"
      value={value}
      onChange={onChange}
      type={type}
      isRequired={required}
      maxLength={maxLength}
      pattern={pattern}
    >
      <Label id={`${id}-label`} htmlFor={id} className="ui-field-label">
        {type === "datetime-local" && <Icon name="clock" width={16} height={16} />}
        {label}
      </Label>
      <Input min={min} max={max} step={type === "number" ? "any" : undefined} aria-describedby={hint ? `${id}-hint` : undefined} />
      {hint && <small className="ui-field-help" id={`${id}-hint`}>{hint}</small>}
      <FieldError />
    </TextField>
  );
}
