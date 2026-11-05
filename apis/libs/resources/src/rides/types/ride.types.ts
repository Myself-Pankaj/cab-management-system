import type { vehicle_category } from '@db/queries/rides/vehicle_fare_rates.queries.js';
import type { IGetRideByIdResult } from '@db/queries/rides/rides.queries.js';
import type { IListPassengersByRideIdResult } from '@db/queries/rides/ride_passengers.queries.js';
import type { IListPaymentsByRideIdResult } from '@db/queries/rides/payments.queries.js';
import type { IListRideStatusHistoryResult } from '@db/queries/rides/ride_status_history.queries.js';

export const VEHICLE_CATEGORY_SEAT_LIMITS: Record<vehicle_category, number> = {
  SEATER_4: 4,
  SEATER_5: 5,
  SEATER_7: 7,
  SEATER_12: 12,
};

export type PaymentSummaryStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface PaymentSummary {
  estimated_fare: number;
  paid_amount: number;
  remaining_amount: number;
  summary_status: PaymentSummaryStatus;
}

export interface FareBreakdown {
  base_fare_inr: number;
  per_km_rate_inr: number;
  distance_km: number;
  distance_charge_inr: number;
  estimated_fare_inr: number;
}

export function toRidePassengerResponse(row: IListPassengersByRideIdResult) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    is_primary: row.is_primary,
    created_at: row.created_at,
  };
}

export function toPaymentResponse(row: IListPaymentsByRideIdResult) {
  return {
    id: row.id,
    ride_id: row.ride_id,
    payment_type: row.payment_type,
    amount: Number(row.amount),
    currency: row.currency,
    provider: row.provider,
    provider_order_id: row.provider_order_id,
    provider_payment_id: row.provider_payment_id,
    status: row.status,
    payment_method: row.payment_method,
    paid_at: row.paid_at,
    failed_at: row.failed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toRideResponse(row: IGetRideByIdResult) {
  return {
    id: row.id,
    booked_by_user_id: row.booked_by_user_id,
    driver_profile_id: row.driver_profile_id,
    vehicle_id: row.vehicle_id,
    requested_vehicle_category: row.requested_vehicle_category,
    passenger_count: row.passenger_count,
    trip_type: row.trip_type,
    pickup_address: row.pickup_address,
    pickup_exact_location: row.pickup_exact_location,
    pickup_latitude: Number(row.pickup_latitude),
    pickup_longitude: Number(row.pickup_longitude),
    destination_address: row.destination_address,
    exact_destination: row.exact_destination,
    destination_latitude: Number(row.destination_latitude),
    destination_longitude: Number(row.destination_longitude),
    distance_km: Number(row.distance_km),
    estimated_duration_minutes: row.estimated_duration_minutes,
    pickup_at: row.pickup_at,
    return_at: row.return_at,
    estimated_fare: Number(row.estimated_fare),
    final_fare: row.final_fare != null ? Number(row.final_fare) : null,
    payment_option: row.payment_option,
    status: row.status,
    assigned_by: row.assigned_by,
    assigned_at: row.assigned_at,
    cancelled_by: row.cancelled_by,
    cancellation_reason: row.cancellation_reason,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toStatusHistoryResponse(row: IListRideStatusHistoryResult) {
  return {
    id: row.id,
    old_status: row.old_status,
    new_status: row.new_status,
    changed_by: row.changed_by,
    note: row.note,
    created_at: row.created_at,
  };
}

export const RIDE_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['PENDING_ASSIGNMENT', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_ASSIGNMENT: ['DRIVER_ASSIGNED', 'CANCELLED'],
  DRIVER_ASSIGNED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
