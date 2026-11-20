import { VEHICLE_CATEGORY_SEAT_LIMITS } from './ride.types.js';
import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';
import type { IGetRideByIdResult } from '@db/queries/rides/rides.queries.js';
export type RideRow = IGetRideByIdResult;
export type OfferStatus =
  'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
export interface RideOffer {
  id: string;
  ride_id: string;
  driver_profile_id: string;
  vehicle_id: string;
  assigned_by: string | null;
  status: OfferStatus;
  expires_at: Date;
  created_at: Date;
  responded_at: Date | null;
  reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  release_reason: string | null;
  cancelled_at: Date | null;
}
export interface RideCompletion {
  id: string;
  ride_id: string;
  driver_profile_id: string;
  declared_by: string;
  declared_cash: string;
  payment_id: string | null;
  note: string | null;
  created_at: Date;
}
export function effectiveOffer(
  offer: RideOffer & { identity_snapshot?: unknown },
  now = Date.now(),
) {
  const snapshot = offer.identity_snapshot;
  const identity =
    snapshot &&
    typeof snapshot === 'object' &&
    'driver_name' in snapshot &&
    'vehicle_number' in snapshot &&
    'vehicle_category' in snapshot
      ? {
          driver_name: String(snapshot.driver_name),
          vehicle_number: String(snapshot.vehicle_number),
          vehicle_category: String(snapshot.vehicle_category),
        }
      : null;
  return {
    ...offer,
    identity,
    status:
      offer.status === 'PENDING' && offer.expires_at.getTime() <= now
        ? ('EXPIRED' as const)
        : offer.status,
  };
}
export function reservationInterval(
  ride: Pick<
    RideRow,
    'pickup_at' | 'return_at' | 'trip_type' | 'estimated_duration_minutes'
  >,
) {
  const start = new Date(ride.pickup_at).getTime();
  const minutes = ride.estimated_duration_minutes;
  if (!Number.isFinite(start) || !minutes || minutes <= 0) return null;
  const returning = ride.return_at ? new Date(ride.return_at).getTime() : NaN;
  if (
    ride.trip_type === 'ROUND_TRIP' &&
    (!Number.isFinite(returning) || returning <= start)
  )
    return null;
  const end =
    ride.trip_type === 'ROUND_TRIP'
      ? returning + minutes * 30_000 + 30 * 60_000
      : start + (minutes + 30) * 60_000;
  return { start, end };
}
export function reservationsConflict(a: RideRow, b: RideRow) {
  if (b.status === 'IN_PROGRESS') return true;
  const first = reservationInterval(a),
    second = reservationInterval(b);
  // Invalid legacy reservations block resources until admin resolves them.
  return (
    !first || !second || (first.start < second.end && second.start < first.end)
  );
}

/** A larger vehicle can fulfil a smaller category without changing the booked fare. */
export function vehicleMeetsCapacity(
  actual: vehicle_category | null,
  requested: vehicle_category,
) {
  return (
    actual !== null &&
    VEHICLE_CATEGORY_SEAT_LIMITS[actual] >=
      VEHICLE_CATEGORY_SEAT_LIMITS[requested]
  );
}
