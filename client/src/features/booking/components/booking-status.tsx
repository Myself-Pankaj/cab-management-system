"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardContent } from "@heroui/react";
import { LoadingSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/record-details";
import { api } from "@/store/api/enhanced-api";
import { apiErrorMessage } from "@/features/auth/api-error";
import { openCheckout } from "../razorpay";
import { bookingStatusLabels, bookingPaymentLabels } from "../booking-labels";
import { routes } from "@/lib/routes";
import { indianTime, money } from "./booking-shared";
const statuses: Record<string, string> = {
  PENDING_PAYMENT: "Your journey is saved. Complete payment.",
  PAYMENT_FAILED: "Your booking is saved. Let’s try payment again.",
  PENDING_ASSIGNMENT: "Awaiting vehicle assignment",
  DRIVER_ASSIGNED: "Your driver has been assigned",
  CONFIRMED: "Your journey is confirmed",
  IN_PROGRESS: "Your journey is underway",
  COMPLETED: "Journey completed",
  CANCELLED: "Booking cancelled",
};
export function BookingStatus({ id }: { id: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const autoStarted = useRef(false);
  const result = api.useRidesControllerGetMineQuery({ id });
  const [pay, paying] = api.useRidesControllerPayOnlineMutation();
  const [verify, verifying] = api.useRidesControllerVerifyPaymentMutation();
  const [message, setMessage] = useState("");
  const [localBusy, setBusy] = useState(false);
  const lock = useRef(false);
  async function checkout() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const order = await pay({ id }).unwrap();
      const response = await openCheckout(order.data);
      if (!response) {
        setMessage(
          "Checkout closed. Your booking is saved; you can pay when you’re ready.",
        );
        return;
      }
      const checked = await verify({
        id,
        verifyRidePaymentDto: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
      }).unwrap();
      if (checked.data.payment_summary.summary_status === "UNPAID")
        setMessage(
          "Payment confirmation is pending. Refresh the status in a moment; please don’t pay again yet.",
        );
    } catch (failure) {
      setMessage(
        failure instanceof Error ? failure.message : apiErrorMessage(failure),
      );
    } finally {
      lock.current = false;
      setBusy(false);
      paying.reset();
      verifying.reset();
      void result.refetch();
    }
  }
  const autoCheckout = useEffectEvent(() => {
    void checkout();
  });
  useEffect(() => {
    if (search.get("checkout") === "1" && result.data && !autoStarted.current) {
      const status = result.data.data.ride.status;
      const timer = setTimeout(() => {
        if (autoStarted.current) return;
        autoStarted.current = true;
        router.replace(`/booking/${id}`);
        if (["PENDING_PAYMENT", "PAYMENT_FAILED"].includes(status))
          autoCheckout();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [search, result.data, router, id]);
  if (result.isLoading)
    return (
      <div className="booking-page page-width"><LoadingSkeleton label="Loading your booking…" count={2} /></div>
    );
  if (!result.data)
    return (
      <div className="booking-empty">
        <h1>We couldn’t load this booking.</h1>
        <p role="alert">{apiErrorMessage(result.error)}</p>
        <Button
          onPress={() => {
            void result.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  const {
    ride,
    passengers,
    payments,
    status_history: history,
    payment_summary: payment,
  } = result.data.data;
  const payable = ["PENDING_PAYMENT", "PAYMENT_FAILED"].includes(ride.status);
  const paymentNote =
    ride.status === "CANCELLED"
      ? "This booking was cancelled. Your recorded payment details are shown below."
      : payment.summary_status === "PAID"
        ? "Your booking is paid in full."
        : ride.status === "COMPLETED"
          ? "Your journey is complete. An outstanding balance is still recorded for this booking."
          : ride.payment_option === "OFFLINE"
            ? "Payment is due offline for your trip."
            : payment.summary_status === "PARTIALLY_PAID"
              ? "Your advance is paid. The remaining balance is payable offline for your trip."
              : "Complete your online payment to proceed with vehicle assignment.";

  return (
    <section className="booking-page page-width">
      <Link href={routes.bookings} className="text-link booking-back-link">
        ← My bookings
      </Link>
      <div className="booking-heading">
        <p className="eyebrow">YOUR SAFAR JOURNEY</p>
        <div className="ui-card-header"><StatusBadge status={ride.status} label={bookingStatusLabels[ride.status]} /><StatusBadge status={payment.summary_status} label={`Payment: ${payment.summary_status.replaceAll("_", " ").toLowerCase()}`} /></div>
        <h1>{statuses[ride.status] ?? ride.status}</h1>
        <p>Booking reference · {ride.id}</p>
      </div>
      <div className="status-grid">
        <Card className="booking-panel">
          <CardContent>
            <h2>Your journey</h2>
            <p>
              <strong>{ride.pickup_address}</strong>
              <br />→ {ride.destination_address}
            </p>
            <p>
              {indianTime(ride.pickup_at)} IST
              {ride.return_at && (
                <>
                  <br />
                  Return {indianTime(ride.return_at)} IST
                </>
              )}
            </p>
            <p>
              {ride.trip_type === "ROUND_TRIP" ? "Round trip" : "One way"} ·{" "}
              {ride.distance_km} km ·{" "}
              {ride.requested_vehicle_category.replace("SEATER_", "")} seat
              category · {ride.bag_count} bags
            </p>
            <p>
              {bookingPaymentLabels[ride.payment_option]} · Booked{" "}
              {indianTime(ride.created_at)} IST
            </p>
            {ride.cancellation_reason && (
              <p className="booking-history-notice">Cancellation reason: {ride.cancellation_reason}</p>
            )}
            <h3>Passengers</h3>
            {passengers.map((passenger) => (
              <p key={passenger.id}>
                {passenger.name} · {passenger.phone}
                {passenger.is_primary && " · Primary contact"}
              </p>
            ))}
            {ride.pickup_exact_location && (
              <p>Pickup: {ride.pickup_exact_location}</p>
            )}
            {ride.exact_destination && (
              <p>Drop-off: {ride.exact_destination}</p>
            )}
            {ride.special_requests && <p>Requests: {ride.special_requests}</p>}
          </CardContent>
        </Card>
        <Card className="booking-panel">
          <CardContent>
            <h2>Payment summary</h2>
            <StatusBadge status={payment.summary_status} />
            <dl className="fare-lines">
              <div>
                <dt>Booking total</dt>
                <dd>{money(payment.estimated_fare)}</dd>
              </div>
              <div>
                <dt>Paid</dt>
                <dd>{money(payment.paid_amount)}</dd>
              </div>
              <div className="fare-total">
                <dt>{ride.status === "CANCELLED" ? "Recorded balance" : "Remaining"}</dt>
                <dd>{money(payment.remaining_amount)}</dd>
              </div>
            </dl>
            {payable && (
              <Button
                className="booking-primary"
                onPress={checkout}
                isDisabled={localBusy}
              >
                {localBusy ? "Opening payment…" : "Continue to payment"}
              </Button>
            )}
            <Button
              variant="secondary"
              isDisabled={result.isFetching || localBusy}
              onPress={() => {
                void result.refetch();
              }}
            >
              Refresh booking status
            </Button>
            {message && (
              <p role="status" className="booking-note">
                {message}
              </p>
            )}
            <p className="booking-note">{paymentNote}</p>
            <Link href="/" className="text-link">
              Plan another journey →
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="booking-detail-history">
        {payments.length > 0 && (
          <Card className="booking-panel">
            <CardContent>
              <h2>Payment details</h2>
              <ul className="booking-payment-records">
                {payments.map((record) => (
                  <li key={record.id}>
                    <div>
                      <strong>
                        {record.payment_type === "ONLINE"
                          ? "Online payment"
                          : "Offline payment"}
                      </strong>
                      <span><StatusBadge status={record.status} />{record.payment_method && ` · ${record.payment_method}`}</span>
                      {record.paid_at && (
                        <time dateTime={record.paid_at}>
                          Paid {indianTime(record.paid_at)} IST
                        </time>
                      )}
                    </div>
                    <strong>{money(record.amount)}</strong>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {history.length > 0 && (
          <Card className="booking-panel">
            <CardContent>
              <h2>Booking updates</h2>
              <ol className="booking-update-list">
                {history.map((event) => (
                  <li key={event.id}>
                    <strong>{bookingStatusLabels[event.new_status]}</strong>
                    <time dateTime={event.created_at}>
                      {indianTime(event.created_at)} IST
                    </time>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
