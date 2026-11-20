/* @name CreateRide */
INSERT INTO rides (
    booked_by_user_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    payment_option,
    status
)
VALUES (
    :bookedByUserId!::uuid,
    :requestedVehicleCategory!::vehicle_category,
    :passengerCount!,
    :bagCount!,
    :specialRequests,
    :bookingKey,
    :bookingPayloadHash,
    :tripType!::trip_type,
    :pickupAddress!,
    :pickupExactLocation,
    :pickupLatitude!,
    :pickupLongitude!,
    :destinationAddress!,
    :exactDestination,
    :destinationLatitude!,
    :destinationLongitude!,
    :distanceKm!,
    :estimatedDurationMinutes!,
    :pickupAt!,
    :returnAt,
    :estimatedFare!,
    :paymentOption!::payment_option,
    :status!::ride_status
)
RETURNING
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at;

/* @name GetRideById */
SELECT
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at
FROM rides
WHERE id = :id!::uuid
LIMIT 1;

/* @name GetRideByIdForBooker */
SELECT
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at
FROM rides
WHERE id = :id!::uuid
  AND booked_by_user_id = :bookedByUserId!::uuid
LIMIT 1;

/* @name ListRidesByBooker */
SELECT
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at
FROM rides
WHERE booked_by_user_id = :bookedByUserId!::uuid
  AND (:status::ride_status IS NULL OR status = :status::ride_status)
  AND (:view::text IS NULL
    OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))
    OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED')))
ORDER BY
  CASE WHEN :view::text = 'upcoming' THEN pickup_at END ASC NULLS LAST,
  CASE WHEN :view::text = 'completed' THEN updated_at END DESC NULLS LAST,
  created_at DESC, id DESC
LIMIT :limit!
OFFSET :offset!;

/* @name ListRidesAdmin */
SELECT
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at
FROM rides
WHERE (:status::ride_status IS NULL OR status = :status::ride_status)
  AND (:category::vehicle_category IS NULL OR requested_vehicle_category = :category::vehicle_category)
ORDER BY created_at DESC
LIMIT :limit!
OFFSET :offset!;

/* @name UpdateRideStatus */
UPDATE rides
SET status = :status!::ride_status
WHERE id = :id!::uuid
RETURNING
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at;

/* @name AssignDriverToRide */
UPDATE rides
SET
    driver_profile_id = :driverProfileId!::uuid,
    vehicle_id = :vehicleId!::uuid,
    assigned_by = :assignedBy!::uuid,
    assigned_at = CURRENT_TIMESTAMP,
    status = 'DRIVER_ASSIGNED'
WHERE id = :id!::uuid
RETURNING
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at;

/* @name CancelRide */
UPDATE rides
SET
    status = 'CANCELLED',
    cancelled_by = :cancelledBy!::uuid,
    cancellation_reason = :reason,
    cancelled_at = CURRENT_TIMESTAMP
WHERE id = :id!::uuid
RETURNING
    id,
    booked_by_user_id,
    driver_profile_id,
    vehicle_id,
    requested_vehicle_category,
    passenger_count,
    bag_count,
    special_requests,
    booking_key,
    booking_payload_hash,
    trip_type,
    pickup_address,
    pickup_exact_location,
    pickup_latitude,
    pickup_longitude,
    destination_address,
    exact_destination,
    destination_latitude,
    destination_longitude,
    distance_km,
    estimated_duration_minutes,
    pickup_at,
    return_at,
    estimated_fare,
    final_fare,
    payment_option,
    status,
    assigned_by,
    assigned_at,
    cancelled_by,
    cancellation_reason,
    cancelled_at,
    created_at,
    updated_at;

/* @name GetRideByBookingKey */
SELECT * FROM rides WHERE booked_by_user_id=:bookedByUserId!::uuid AND booking_key=:bookingKey!::uuid LIMIT 1;

/* @name CountPassengerRides */
SELECT
 COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED'))::int AS upcoming,
 COUNT(*) FILTER (WHERE status IN ('COMPLETED', 'CANCELLED'))::int AS completed,
 COUNT(*) FILTER (WHERE (:status::ride_status IS NULL OR status = :status::ride_status)
   AND (:view::text IS NULL
     OR (:view::text = 'upcoming' AND status NOT IN ('COMPLETED', 'CANCELLED'))
     OR (:view::text = 'completed' AND status IN ('COMPLETED', 'CANCELLED'))))::int AS total
FROM rides WHERE booked_by_user_id = :bookedByUserId!::uuid;
