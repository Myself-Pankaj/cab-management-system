/* @name InsertRideStatusHistory */
INSERT INTO ride_status_history (
    ride_id,
    old_status,
    new_status,
    changed_by,
    note
)
VALUES (
    :rideId!::uuid,
    :oldStatus::ride_status,
    :newStatus!::ride_status,
    :changedBy::uuid,
    :note
)
RETURNING
    id,
    ride_id,
    old_status,
    new_status,
    changed_by,
    note,
    created_at;

/* @name ListRideStatusHistory */
SELECT
    id,
    ride_id,
    old_status,
    new_status,
    changed_by,
    note,
    created_at
FROM ride_status_history
WHERE ride_id = :rideId!::uuid
ORDER BY created_at ASC;
