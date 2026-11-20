"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@heroui/react";
import { useRidesControllerEstimatesMutation } from "@/store/api/generated/api";
import { categorySelected } from "@/store/slices/booking";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BookingShell, JourneySummary, money } from "./booking-shared";
import { Icon } from "@/components/ui/icon";
import { QueryState } from "@/components/shared/query-state";
import { CabImage } from "./cab-image";
export function CabSelection() {
  const journey = useAppSelector((state) => state.booking.journey);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [estimate, result] = useRidesControllerEstimatesMutation({
    fixedCacheKey: "booking-estimates",
  });
  const started = useRef(false);
  useEffect(() => {
    if (!journey) {
      router.replace("/");
      return;
    }
    if (!result.data && !started.current) {
      started.current = true;
      void estimate({ rideEstimateDto: journey })
        .unwrap()
        .catch(() => { });
    }
  }, [journey, router, estimate, result.data]);
  if (!journey) return null;
  const data = result.data?.data;
  return (
    <BookingShell
      step={2}
      title="A little more comfort. Your way."
      intro="Choose your cab category. We’ll assign your vehicle and driver after booking."
    >
      <Link className="text-link" href="/">
        ← Edit journey
      </Link>
      <JourneySummary
        journey={journey}
        distance={data?.distance_km}
        minutes={data?.estimated_duration_minutes}
      />
      <QueryState loading={result.isLoading} error={result.error}
        empty={Boolean(data && !data.categories.length)}
        loadingLabel="Finding your route and calculating fares…"
        emptyTitle="No cab categories are available right now."
        emptyDescription="Please try again later or change your journey."
        retry={() => { void estimate({ rideEstimateDto: journey }); }} />
      <div className="cab-grid">
        {data?.categories.map((cab) => (
          <Card className="cab-card" key={cab.category}>
            <CabImage src={cab.image_url} name={cab.display_name} />
            <small className="ui-image-caption">Category example · actual vehicle may differ</small>
            <CardContent>
              <p className="eyebrow">
                {cab.seat_limit} SEATS · {cab.bag_capacity} BAGS
              </p>
              <h2>{cab.display_name}</h2>
              <p>
                {cab.description || "Space to settle in and enjoy the journey."}
              </p>
              <div className="ui-cab-facts">
                <span><Icon name="user" />{cab.seat_limit} seats</span>
                <span><Icon name="bag" />{cab.bag_capacity} bags</span>
              </div>
              <div className="cab-price">
                <div>
                  <small>Estimated journey fare</small>
                  <strong>
                    {money(cab.fare_breakdown.estimated_fare_inr)}
                  </strong>
                </div>
                <Button
                  className="booking-primary"
                  aria-label={`Select ${cab.display_name}`}
                  onPress={() => {
                    dispatch(categorySelected(cab.category));
                    router.push("/booking/preview");
                  }}
                >
                  Select <span aria-hidden="true">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {data && (
        <p className="booking-note">
          Fares are rechecked before booking. Driving times are estimates and
          exclude stops
          {journey.trip_type === "ROUND_TRIP"
            ? "; distance and driving time include the configured return journey multiplier"
            : ""}
          .
        </p>
      )}
    </BookingShell>
  );
}
