"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Form } from "@heroui/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { bookingCleared, journeySelected } from "@/store/slices/booking";
import type { LocationSuggestionDto } from "@/store/api/generated/api";
import { useRidesControllerEstimatesMutation } from "@/store/api/generated/api";
import { Icon } from "@/components/ui/icon";
import { BookingField, BookingShell } from "./booking-shared";
import { LocationField } from "./location-field";

const localDate = (iso?: string) =>
  iso
    ? new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 16)
    : "";
export function JourneyForm() {
  const draft = useAppSelector((state) => state.booking);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [pickup, setPickup] = useState<LocationSuggestionDto | null>(
    draft.journey
      ? {
        id: "pickup",
        label: draft.journey.pickup_address,
        latitude: draft.journey.pickup_latitude,
        longitude: draft.journey.pickup_longitude,
      }
      : null,
  );
  const [destination, setDestination] = useState<LocationSuggestionDto | null>(
    draft.journey
      ? {
        id: "destination",
        label: draft.journey.destination_address,
        latitude: draft.journey.destination_latitude,
        longitude: draft.journey.destination_longitude,
      }
      : null,
  );
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP">(
    draft.journey?.trip_type ?? "ONE_WAY",
  );
  const [pickupAt, setPickupAt] = useState(localDate(draft.journey?.pickup_at));
  const [returnAt, setReturnAt] = useState(localDate(draft.journey?.return_at));
  const [error, setError] = useState("");
  const clock = useRef(0);
  const [, estimates] = useRidesControllerEstimatesMutation({
    fixedCacheKey: "booking-estimates",
  });
  const invalidate = () => {
    if (draft.journey) {
      dispatch(bookingCleared());
      estimates.reset();
    }
  };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!pickup || !destination) {
      setError("Choose both locations from the suggestions.");
      return;
    }
    if (
      pickup.latitude === destination.latitude &&
      pickup.longitude === destination.longitude
    ) {
      setError("Choose different pickup and destination locations.");
      return;
    }
    const date = new Date(`${pickupAt}:00+05:30`);
    const back = returnAt ? new Date(`${returnAt}:00+05:30`) : null;
    if (
      !Number.isFinite(date.getTime()) ||
      date.getTime() <= Date.now() ||
      (tripType === "ROUND_TRIP" &&
        (!back || !Number.isFinite(back.getTime()) || back <= date))
    ) {
      setError("Choose a future pickup time and a return time after pickup.");
      return;
    }
    estimates.reset();
    dispatch(
      journeySelected({
        pickup_address: pickup.label,
        pickup_latitude: pickup.latitude,
        pickup_longitude: pickup.longitude,
        destination_address: destination.label,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
        trip_type: tripType,
        pickup_at: date.toISOString(),
        ...(tripType === "ROUND_TRIP" && back
          ? { return_at: back.toISOString() }
          : {}),
      }),
    );
    router.push("/booking/cabs");
  }
  return (
    <BookingShell
      step={1}
      title="Where will your next story begin?"
      intro="A thoughtful journey starts with a place in mind."
    >
      <Card className="journey-card">
        <CardContent>
          <div className="ui-section-heading">
            <Icon name="pin" />
            <div><h2>Plan your journey</h2><p>Choose your route and schedule. We’ll show cab categories and estimated fares next.</p></div>
          </div>
          <Form
            onSubmit={submit}
            validationBehavior="native"
            className="booking-form"
          >
            <div className="booking-mode" role="group" aria-label="Trip type">
              {(["ONE_WAY", "ROUND_TRIP"] as const).map((type) => (
                <Button
                  key={type}
                  variant={tripType === type ? "primary" : "ghost"}
                  aria-pressed={tripType === type}
                  onPress={() => {
                    setTripType(type);
                    invalidate();
                  }}
                >
                  {type === "ONE_WAY" ? "One way" : "Round trip"}
                </Button>
              ))}
            </div>
            <div className="booking-field-grid">
              <LocationField
                label="Pickup location"
                selected={pickup}
                onSelect={setPickup}
                onEdit={invalidate}
                clock={clock}
              />
              <LocationField
                label="Destination"
                selected={destination}
                onSelect={setDestination}
                onEdit={invalidate}
                clock={clock}
              />
            </div>
            <div className="booking-field-grid">
              <BookingField
                label="Pickup date & time (IST)"
                hint="Choose a future pickup time. All times are in India Standard Time."
                type="datetime-local"
                value={pickupAt}
                onChange={(value) => {
                  setPickupAt(value);
                  invalidate();
                }}
                required
              />
              {tripType === "ROUND_TRIP" && (
                <BookingField
                  label="Return journey starts (IST)"
                  hint="Choose when your return journey starts, after your pickup time."
                  type="datetime-local"
                  value={returnAt}
                  onChange={(value) => {
                    setReturnAt(value);
                    invalidate();
                  }}
                  required
                />
              )}
            </div>
            {error && (
              <p role="alert" className="booking-error">
                {error}
              </p>
            )}
            <div className="booking-form-footer">
              <p>
                India, at your own pace.
                <br />
                All journey times are in IST.
              </p>
              <Button type="submit" className="booking-primary">
                Explore cabs <span aria-hidden="true">→</span>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
      <div className="booking-promises">
        <span>Choose your comfort</span>
        <span>Clear fare breakdowns</span>
        <span>A journey made for you</span>
      </div>
    </BookingShell>
  );
}
