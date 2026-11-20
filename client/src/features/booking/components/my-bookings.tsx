"use client";

import { LoadingSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/record-details";
import { Fragment, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent, Pagination, Tabs } from "@heroui/react";
import { api } from "@/store/api/enhanced-api";
import type { RideResponseDto } from "@/store/api/generated/api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { bookingPaymentLabels, bookingStatusLabels } from "../booking-labels";
import { duration, indianTime, money } from "./booking-shared";

const PAGE_SIZE = 10;
type BookingTab = "upcoming" | "completed";

function BookingCard({ ride }: { ride: RideResponseDto }) {
  const pendingPayment =
    ride.status === "PENDING_PAYMENT" || ride.status === "PAYMENT_FAILED";
  return (
    <Card className="booking-history-card" data-status={ride.status}>
      <CardContent>
        <div className="booking-history-top">
          <StatusBadge status={ride.status} label={bookingStatusLabels[ride.status]} />
          <span className="booking-reference">Reference · {ride.id}</span>
        </div>
        <div className="booking-history-main">
          <div className="booking-history-route">
            <div>
              <span className="eyebrow">PICKUP</span>
              <h2>{ride.pickup_address}</h2>
            </div>
            <Icon name="arrow" width={22} height={22} />
            <div>
              <span className="eyebrow">DESTINATION</span>
              <h2>{ride.destination_address}</h2>
            </div>
          </div>
          <div className="booking-history-price">
            <span>
              {ride.final_fare === null ? "Estimated fare" : "Final fare"}
            </span>
            <strong>{money(ride.final_fare ?? ride.estimated_fare)}</strong>
            <small>{bookingPaymentLabels[ride.payment_option]}</small>
          </div>
        </div>
        <dl className="booking-history-facts">
          <div>
            <dt>Pickup · IST</dt>
            <dd>{indianTime(ride.pickup_at)}</dd>
          </div>
          {ride.return_at && (
            <div>
              <dt>Return · IST</dt>
              <dd>{indianTime(ride.return_at)}</dd>
            </div>
          )}
          <div>
            <dt>Journey</dt>
            <dd>
              {ride.trip_type === "ROUND_TRIP" ? "Round trip" : "One way"} ·{" "}
              {ride.distance_km} km ·{" "}
              {duration(ride.estimated_duration_minutes)} driving
            </dd>
          </div>
          <div>
            <dt>Travellers & cab</dt>
            <dd>
              {ride.passenger_count}{" "}
              {ride.passenger_count === 1 ? "passenger" : "passengers"} ·{" "}
              {ride.bag_count} {ride.bag_count === 1 ? "bag" : "bags"} ·{" "}
              {ride.requested_vehicle_category.replace("SEATER_", "")} seat cab
            </dd>
          </div>
        </dl>
        {ride.status === "CANCELLED" && ride.cancellation_reason && (
          <p className="booking-history-notice">
            Cancellation reason: {ride.cancellation_reason}
          </p>
        )}
        {pendingPayment && (
          <p className="booking-history-notice">
            {ride.status === "PAYMENT_FAILED"
              ? "Your payment didn’t go through."
              : "Payment is still pending."}{" "}
            Open your booking to complete payment.
          </p>
        )}
        <div className="booking-history-bottom">
          <span>Booked {indianTime(ride.created_at)} IST</span>
          <Link className="text-link" href={`/booking/${ride.id}`}>
            View full details
            <Icon name="arrow" width={17} height={17} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyBookings() {
  const router = useRouter();
  const search = useSearchParams();
  const tab: BookingTab =
    search.get("tab") === "completed" ? "completed" : "upcoming";
  const rawPage = search.get("page") ?? "1";
  const number = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page =
    Number.isSafeInteger(number) && number >= 1 && number <= 214748365
      ? number
      : 1;
  const result = api.useRidesControllerListMineQuery(
    { view: tab, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true },
  );
  const data = result.currentData?.data;
  const counts = result.data?.data.counts;
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    : page;
  useEffect(() => {
    if (data && page > totalPages)
      router.replace(`${routes.bookings}?tab=${tab}&page=${totalPages}`, {
        scroll: false,
      });
  }, [data, page, totalPages, router, tab]);
  function navigate(nextTab: BookingTab, nextPage: number) {
    router.push(`${routes.bookings}?tab=${nextTab}&page=${nextPage}`, {
      scroll: false,
    });
    document
      .getElementById("my-bookings-tabs")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const content = (
    <div className="booking-history-results" aria-busy={result.isFetching}>
      {(!data || page > totalPages) && !result.error && (
        <LoadingSkeleton label="Opening your journeys…" />
      )}
      {result.error && (
        <div className="booking-history-empty">
          <h2>We couldn’t load your bookings.</h2>
          <p role="alert">{apiErrorMessage(result.error)}</p>
          <Button
            onPress={() => {
              void result.refetch();
            }}
            isDisabled={result.isFetching}
          >
            Try again
          </Button>
        </div>
      )}
      {data && !result.error && page <= totalPages && (
        <>
          <div className="booking-history-list-heading">
            <p>
              {tab === "upcoming"
                ? "Your upcoming and active journeys"
                : "Your completed and cancelled journeys"}
            </p>
            <span role="status">
              {result.isFetching
                ? "Updating…"
                : `${data.total} ${data.total === 1 ? "booking" : "bookings"}`}
            </span>
          </div>
          {!data.rides.length ? (
            <div className="booking-history-empty">
              <Icon name="car" width={34} height={34} />
              <h2>
                {tab === "upcoming"
                  ? "Your next journey is waiting."
                  : "Your journey history starts here."}
              </h2>
              <p>
                {tab === "upcoming"
                  ? "You don’t have any upcoming bookings yet."
                  : "Completed and cancelled bookings will appear here."}
              </p>
              <Link href={routes.home} className="action-link">
                Plan a journey
                <Icon name="arrow" width={18} height={18} />
              </Link>
            </div>
          ) : (
            <div className="booking-history-list">
              {data.rides.map((ride) => (
                <BookingCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
          {data.total > 0 && (
            <Pagination
              aria-label={`${tab} bookings pages`}
              className="booking-history-pagination"
            >
              <Pagination.Summary>
                Showing {data.offset + 1}–
                {Math.min(data.offset + data.rides.length, data.total)} of{" "}
                {data.total}
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    aria-label="Previous page"
                    isDisabled={page <= 1}
                    onPress={() => navigate(tab, page - 1)}
                  >
                    <Pagination.PreviousIcon />
                    <span className="history-page-word">Previous</span>
                  </Pagination.Previous>
                </Pagination.Item>
                {pageNumbers.map((value, index) => (
                  <Fragment key={value}>
                    {index > 0 && value - pageNumbers[index - 1] > 1 && (
                      <Pagination.Item>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    )}
                    <Pagination.Item>
                      <Pagination.Link
                        aria-label={`Page ${value}`}
                        aria-current={page === value ? "page" : undefined}
                        isActive={page === value}
                        onPress={() => navigate(tab, value)}
                      >
                        {value}
                      </Pagination.Link>
                    </Pagination.Item>
                  </Fragment>
                ))}
                <Pagination.Item>
                  <Pagination.Next
                    aria-label="Next page"
                    isDisabled={page >= totalPages}
                    onPress={() => navigate(tab, page + 1)}
                  >
                    <span className="history-page-word">Next</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
  return (
    <section className="booking-page page-width booking-history">
      <div className="booking-history-heading">
        <div>
          <p className="eyebrow">YOUR SAFAR ACCOUNT</p>
          <h1>
            Every journey.
            <br />
            <em>All in one place.</em>
          </h1>
          <p>Your plans ahead, and the journeys behind you.</p>
        </div>
        <Link href={routes.home} className="action-link">
          Book a ride
          <Icon name="arrow" width={18} height={18} />
        </Link>
      </div>
      <Tabs
        id="my-bookings-tabs"
        selectedKey={tab}
        onSelectionChange={(key) => {
          if (key === "upcoming" || key === "completed") navigate(key, 1);
        }}
        className="booking-history-tabs"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="My bookings">
            <Tabs.Tab id="upcoming">
              Upcoming
              <span className="booking-tab-count">
                {counts?.upcoming ?? "—"}
              </span>
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="completed">
              Completed
              <span className="booking-tab-count">
                {counts?.completed ?? "—"}
              </span>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="upcoming">{content}</Tabs.Panel>
        <Tabs.Panel id="completed">{content}</Tabs.Panel>
      </Tabs>
    </section>
  );
}
