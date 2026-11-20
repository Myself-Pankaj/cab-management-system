"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Form,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  bookingCleared,
  bookingDetailsChanged,
  bookingKeyAssigned,
  type BookingDetails,
} from "@/store/slices/booking";
import {
  useRidesControllerEstimatesMutation,
  useRidesControllerQuoteMutation,
} from "@/store/api/generated/api";
import { StatusBadge } from "@/components/shared/record-details";
import { api } from "@/store/api/enhanced-api";
import type {
  CreateRideDto,
  RideQuoteDto,
  RidePassengerDto,
} from "@/store/api/generated/api";
import { useSession } from "@/features/auth/hooks/use-session";
import { apiErrorCode, apiErrorMessage } from "@/features/auth/api-error";
import {
  BookingField,
  BookingShell,
  JourneySummary,
  money,
} from "./booking-shared";

import {
  PaymentOptions,
  paymentAmounts,
  paymentNames,
} from "./payment-options";

export function BookingPreview() {
  const draft = useAppSelector((state) => state.booking);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const session = useSession();
  const [, estimates] = useRidesControllerEstimatesMutation({
    fixedCacheKey: "booking-estimates",
  });
  const [quote, quoted] = useRidesControllerQuoteMutation();
  const [create, creating] = api.useRidesControllerCreateMutation();
  const [error, setError] = useState("");
  const lock = useRef(false);
  const completed = useRef(false);
  const cab = estimates.data?.data.categories.find(
    (item) => item.category === draft.category,
  );
  useEffect(() => {
    if (completed.current) return;
    if (!draft.journey) router.replace("/");
    else if (!draft.category || !cab) router.replace("/booking/cabs");
  }, [draft.journey, draft.category, cab, router]);
  if (!draft.journey || !draft.category || !cab) return null;
  const journey = draft.journey;
  const options = estimates.data!.data;
  const passengers: RidePassengerDto[] = draft.details.passengers.length
    ? draft.details.passengers
    : [
      {
        name: session.user?.full_name ?? "",
        phone: session.user?.phone_number ?? "+91",
        is_primary: true,
      },
    ];
  const details = { ...draft.details, passengers };
  const quoteBody: RideQuoteDto = {
    ...journey,
    passengers: passengers.map((p) => ({
      ...p,
      name: p.name.trim(),
      phone: p.phone.trim(),
    })),
    vehicle_category: draft.category,
    bag_count: details.bag_count,
    special_requests: details.special_requests,
    pickup_exact_location: details.pickup_exact_location,
    exact_destination: details.exact_destination,
  };
  const currentQuote =
    quoted.originalArgs &&
      JSON.stringify(quoted.originalArgs.rideQuoteDto) ===
      JSON.stringify(quoteBody)
      ? quoted.data
      : undefined;
  const busy = quoted.isLoading || creating.isLoading;
  const fare = currentQuote?.data.fare_breakdown ?? cab.fare_breakdown;
  const total = fare.estimated_fare_inr;
  const { now, later } = paymentAmounts(
    details.payment_option,
    total,
    options.partial_advance_percent,
  );
  const change = (patch: Partial<BookingDetails>) => {
    dispatch(bookingDetailsChanged({ ...details, ...patch }));
    quoted.reset();
    setError("");
  };
  const changePassenger = (index: number, patch: Partial<RidePassengerDto>) =>
    change({
      passengers: passengers.map((passenger, i) =>
        i === index ? { ...passenger, ...patch } : passenger,
      ),
    });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !draft.category) return;
    if (
      passengers.length > cab!.seat_limit ||
      details.bag_count > cab!.bag_capacity ||
      !Number.isInteger(details.bag_count) ||
      details.bag_count < 0
    ) {
      setError("Please check the passenger and bag capacity for this cab.");
      return;
    }
    lock.current = true;
    setError("");
    const body: CreateRideDto = {
      ...quoteBody,
      payment_option: details.payment_option,
    };
    try {
      if (!currentQuote) {
        await quote({ rideQuoteDto: quoteBody }).unwrap();
        return;
      }
      const key = draft.key ?? crypto.randomUUID();
      dispatch(bookingKeyAssigned(key));
      const result = await create({
        createRideDto: { ...body, booking_key: key, accepted_fare_inr: total },
      }).unwrap();
      completed.current = true;
      dispatch(bookingCleared());
      estimates.reset();
      quoted.reset();
      creating.reset();
      router.replace(
        `/booking/${result.data.ride.id}${body.payment_option !== "OFFLINE" ? "?checkout=1" : ""}`,
      );
    } catch (failure) {
      setError(apiErrorMessage(failure));
      if (apiErrorCode(failure) === "FARE_CHANGED") {
        quoted.reset();
        setError(
          "The fare changed. Select ‘Review total’ to check the current price before confirming.",
        );
      }
    } finally {
      lock.current = false;
    }
  }
  return (
    <BookingShell
      step={3}
      title="The details make it yours."
      intro="A final look before your journey begins."
    >
      <Link href="/booking/cabs" className="text-link">
        ← Change cab
      </Link>
      <JourneySummary
        journey={journey}
        distance={options.distance_km}
        minutes={options.estimated_duration_minutes}
      />
      <Form
        validationBehavior="native"
        onSubmit={submit}
        className="preview-layout"
      >
        <fieldset disabled={busy} className="booking-submit-fields">
          <div className="preview-details">
            <Card className="booking-panel">
              <CardContent>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">YOUR TRAVEL COMPANY</p>
                    <h2>Who’s coming along?</h2>
                  </div>
                  <span>
                    {passengers.length} / {cab.seat_limit} seats
                  </span>
                </div>
                {passengers.map((passenger, index) => (
                  <div className="passenger-row" key={index}>
                    <div className="passenger-row-heading">
                      <strong>
                        Passenger {index + 1}
                        {passenger.is_primary ? " · Primary contact" : ""}
                      </strong>
                      {passengers.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={busy}
                          onPress={() => {
                            const next = passengers.filter(
                              (_, i) => i !== index,
                            );
                            if (passenger.is_primary)
                              next[0] = { ...next[0], is_primary: true };
                            change({ passengers: next });
                          }}
                        >
                          Remove passenger {index + 1}
                        </Button>
                      )}
                    </div>
                    <div className="booking-field-grid">
                      <BookingField
                        label={`Passenger ${index + 1} name`}
                        value={passenger.name}
                        onChange={(name) => changePassenger(index, { name })}
                        required
                        maxLength={100}
                      />
                      <BookingField
                        label={`Passenger ${index + 1} phone`}
                        value={passenger.phone}
                        type="tel"
                        onChange={(phone) => changePassenger(index, { phone })}
                        required
                        maxLength={20}
                        pattern="\+?[0-9]{7,15}"
                      />
                    </div>
                    {!passenger.is_primary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isDisabled={busy}
                        onPress={() =>
                          change({
                            passengers: passengers.map((p, i) => ({
                              ...p,
                              is_primary: i === index,
                            })),
                          })
                        }
                      >
                        Make primary contact
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="secondary"
                  isDisabled={busy || passengers.length >= cab.seat_limit}
                  onPress={() =>
                    change({
                      passengers: [
                        ...passengers,
                        { name: "", phone: "+91", is_primary: false },
                      ],
                    })
                  }
                >
                  + Add passenger
                </Button>
              </CardContent>
            </Card>
            <Card className="booking-panel">
              <CardContent>
                <p className="eyebrow">A LITTLE MORE PERSONAL</p>
                <h2>Bags & finishing touches</h2>
                <div className="booking-field-grid">
                  <BookingField
                    label={`Number of bags (up to ${cab.bag_capacity})`}
                    type="number"
                    min={0}
                    max={cab.bag_capacity}
                    value={String(details.bag_count)}
                    onChange={(value) => change({ bag_count: Number(value) })}
                    required
                  />
                  <BookingField
                    label="Pickup instructions (optional)"
                    value={details.pickup_exact_location}
                    onChange={(pickup_exact_location) =>
                      change({ pickup_exact_location })
                    }
                    maxLength={500}
                  />
                  <BookingField
                    label="Drop-off instructions (optional)"
                    value={details.exact_destination}
                    onChange={(exact_destination) =>
                      change({ exact_destination })
                    }
                    maxLength={500}
                  />
                </div>
                <TextField
                  aria-label="Special requests (optional)"
                  className="safar-field"
                  value={details.special_requests}
                  onChange={(special_requests) => change({ special_requests })}
                  maxLength={1000}
                >
                  <Label>Special requests (optional)</Label>
                  <TextArea placeholder="Anything that would make your journey more comfortable?" />
                </TextField>
                <p className="booking-note">
                  Requests are shared as notes. They carry no extra fee and are
                  subject to fulfillment.
                </p>
              </CardContent>
            </Card>
            <PaymentOptions
              value={details.payment_option}
              onChange={(payment_option) => {
                dispatch(bookingDetailsChanged({ ...details, payment_option }));
                setError("");
              }}
              total={total}
              advancePercent={options.partial_advance_percent}
              onlineAvailable={options.online_payment_available}
              disabled={busy}
            />
          </div>
          <Card className="booking-panel fare-panel">
            <CardContent>
              <p className="eyebrow">YOUR JOURNEY, AT A GLANCE</p>
              <div className="ui-quote-state"><StatusBadge status={currentQuote ? "CONFIRMED" : "PENDING"} label={currentQuote ? "Fare reviewed" : "Estimate · review required"} /></div>
              <h2>{cab.display_name}</h2>
              <p>{passengers.length} {passengers.length === 1 ? "traveller" : "travellers"} · {details.bag_count} bags selected</p>
              <p>
                {cab.seat_limit} seats · {cab.bag_capacity} bags maximum
              </p>
              <dl className="fare-lines">
                <div>
                  <dt>Base fare</dt>
                  <dd>{money(fare.base_fare_inr)}</dd>
                </div>
                <div>
                  <dt>
                    {fare.distance_km} km × {money(fare.per_km_rate_inr)}
                  </dt>
                  <dd>{money(fare.distance_charge_inr)}</dd>
                </div>
                {total > fare.base_fare_inr + fare.distance_charge_inr && (
                  <div>
                    <dt>Minimum fare adjustment</dt>
                    <dd>
                      {money(
                        total - fare.base_fare_inr - fare.distance_charge_inr,
                      )}
                    </dd>
                  </div>
                )}
                <div className="fare-total">
                  <dt>{currentQuote ? "Reviewed booking total" : "Estimated total"}</dt>
                  <dd>{money(total)}</dd>
                </div>
              </dl>
              <div
                className="payment-summary"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="payment-summary-label">
                  {paymentNames[details.payment_option]}
                </p>
                <dl className="fare-lines payment-split">
                  <div className="payment-due-now">
                    <dt>Due now</dt>
                    <dd>{money(now)}</dd>
                  </div>
                  <div>
                    <dt>Due later, offline</dt>
                    <dd>{money(later)}</dd>
                  </div>
                </dl>
                <p className="payment-summary-note">
                  {details.payment_option === "OFFLINE"
                    ? "No online payment is needed to book."
                    : "Razorpay Checkout opens after you confirm."}
                </p>
              </div>
              {error && (
                <p role="alert" className="booking-error">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="booking-primary"
                isDisabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : !currentQuote
                    ? "Review total"
                    : details.payment_option === "OFFLINE"
                      ? "Confirm booking"
                      : `Confirm & pay ${money(now)}`}
              </Button>
              <p className="booking-note">
                {currentQuote
                  ? "Fare checked. Confirm to create your booking."
                  : "Review the latest fare before confirming."}{" "}
                Vehicle assignment follows booking and any required advance
                payment.
              </p>
            </CardContent>
          </Card>
        </fieldset>
      </Form>
    </BookingShell>
  );
}
