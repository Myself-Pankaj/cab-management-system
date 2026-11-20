"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { api } from "@/store/api/enhanced-api";
import type { DriverRidesControllerListApiArg } from "@/store/api/generated/api";
import { indianTime } from "@/features/booking/components/booking-shared";
import { DriverOnboarding } from "./onboarding";
import { StatusBadge, readable } from "@/components/shared/record-details";
import { MetricCard } from "@/components/shared/metric-card";
import { QueryState } from "@/components/shared/query-state";
import { RecordPagination } from "@/components/shared/record-pagination";
import { Icon } from "@/components/ui/icon";

export function DriverDashboard() {
  const onboarding = api.useDriversControllerGetOnboardingQuery(undefined, {
    refetchOnFocus: true,
  });
  const [view, setView] =
    useState<NonNullable<DriverRidesControllerListApiArg["view"]>>("assigned");
  const [offset, setOffset] = useState(0);
  const status = onboarding.data?.data.profile.status;
  const query = api.useDriverRidesControllerListQuery(
    { view, limit: 20, offset },
    {
      skip: !status || !["APPROVED", "SUSPENDED"].includes(status),
      refetchOnFocus: true,
    },
  );
  const page = query.currentData?.data;
  if (status && !["APPROVED", "SUSPENDED"].includes(status))
    return <DriverOnboarding />;
  const refresh = () => {
    void onboarding.refetch();
    if (!query.isUninitialized) void query.refetch();
  };
  const views = {
    assigned: "Assigned",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    history: "Offer history",
  } as const;
  return (
    <section className="booking-page page-width operations-page">
      <div className="booking-heading">
        <p className="eyebrow">DRIVER WORKSPACE</p>
        <h1>Your rides, at a glance.</h1>
        <p>
          Review your assignments, prepare for pickup, and keep every journey
          moving.
        </p>
      </div>
      <div className="operations-toolbar">
        <Link href="/driver/onboarding" className="text-link">
          Vehicle & documents <Icon name="arrow" width={16} height={16} />
        </Link>
        <Button
          isDisabled={onboarding.isFetching || query.isFetching}
          onPress={refresh}
        >
          Refresh workspace
        </Button>
      </div>
      {onboarding.data && (
        <div className="ui-metrics">
          <MetricCard
            label="Driver verification"
            value={readable(
              status === "SUSPENDED"
                ? "SUSPENDED"
                : onboarding.data.data.application_status,
            )}
            detail="Your current application verification"
            href="/driver/onboarding"
          />
          <MetricCard
            label="New ride eligibility"
            value={
              onboarding.data.data.ride_eligible
                ? "Ready for offers"
                : "Review required"
            }
            detail={
              onboarding.data.data.ride_eligible
                ? "All verification requirements are satisfied"
                : "Check your documents and account status"
            }
            href="/driver/onboarding"
          />
          <MetricCard
            label={`${views[view]} records`}
            value={page ? page.total.toLocaleString("en-IN") : "—"}
            detail="Server total for the selected view"
          />
        </div>
      )}
      {status === "APPROVED" &&
        onboarding.data &&
        !onboarding.data.data.ride_eligible && (
          <p role="status" className="booking-error">
            Your documents or vehicle need review. New ride actions are paused;
            you can finish an already-started ride.{" "}
            <Link href="/driver/onboarding">View corrections →</Link>
          </p>
        )}
      {status === "SUSPENDED" && (
        <p role="alert" className="booking-error">
          Account suspended. Admin must resolve your active rides.
        </p>
      )}
      <nav className="operations-tabs" aria-label="Ride views">
        {(Object.keys(views) as (keyof typeof views)[]).map((tab) => (
          <button
            key={tab}
            aria-current={view === tab ? "page" : undefined}
            onClick={() => {
              setView(tab);
              setOffset(0);
            }}
          >
            {views[tab]}
          </button>
        ))}
      </nav>
      <QueryState
        loading={onboarding.isLoading || (!page && query.isFetching)}
        error={onboarding.error ?? query.error}
        empty={Boolean(page && !page.offers.length)}
        retry={refresh}
        loadingLabel="Loading your rides…"
        emptyTitle={`No ${view === "history" ? "past offers" : view + " rides"} in this view.`}
        emptyDescription="Try another view or refresh to check for updates."
      />
      {page && !query.error && (
        <>
          <p className="ui-results-note" role="status">
            {query.isFetching
              ? "Updating this view…"
              : `${page.offers.length} records shown on this page · schedule times in IST`}
          </p>
          <div className="operations-grid" aria-busy={query.isFetching}>
            {page.offers.map((offer) => (
              <article key={offer.id} className="operations-card">
                <div className="ui-card-header">
                  <StatusBadge
                    status={offer.status}
                    label={`Offer: ${readable(offer.status)}`}
                  />
                  <StatusBadge status={offer.ride_status} />
                </div>
                <div className="ui-route" aria-label="Journey route">
                  <div>
                    <Icon name="pin" />
                    <div>
                      <small>Pickup</small>
                      <strong>{offer.pickup_address}</strong>
                    </div>
                  </div>
                  <div>
                    <Icon name="arrow" />
                    <div>
                      <small>Destination</small>
                      <strong>{offer.destination_address}</strong>
                    </div>
                  </div>
                </div>
                <div className="ui-schedule">
                  <Icon name="clock" width={20} height={20} />
                  <div>
                    <time dateTime={offer.pickup_at}>
                      {indianTime(offer.pickup_at)} IST
                    </time>
                    <small>Scheduled pickup</small>
                  </div>
                </div>
                {offer.reason && (
                  <p className="booking-history-notice">{offer.reason}</p>
                )}
                {offer.release_reason && (
                  <p className="booking-history-notice">
                    Released: {offer.release_reason}
                  </p>
                )}
                <div className="ui-card-footer">
                  <small className="ui-muted">
                    Offer expiry · {indianTime(offer.expires_at)} IST
                  </small>
                  {offer.can_view_ride && (
                    <Link
                      className="operations-link"
                      href={`/driver/rides/${offer.ride_id}`}
                      aria-label={`View ride from ${offer.pickup_address} to ${offer.destination_address}`}
                    >
                      View ride →
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
          <RecordPagination
            total={page.total}
            offset={offset}
            busy={query.isFetching}
            onChange={setOffset}
          />
        </>
      )}
    </section>
  );
}
