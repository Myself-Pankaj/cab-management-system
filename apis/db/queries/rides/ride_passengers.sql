/* @name CreateRidePassenger */
INSERT INTO ride_passengers (
    ride_id,
    name,
    phone,
    is_primary
)
VALUES (
    :rideId!::uuid,
    :name!,
    :phone!,
    :isPrimary!
)
RETURNING
    id,
    ride_id,
    name,
    phone,
    is_primary,
    created_at;

/* @name ListPassengersByRideId */
SELECT
    id,
    ride_id,
    name,
    phone,
    is_primary,
    created_at
FROM ride_passengers
WHERE ride_id = :rideId!::uuid
ORDER BY is_primary DESC, created_at ASC;
