/* @name InsertRideCancellation */
INSERT INTO ride_cancellations (
    ride_id,
    cancelled_by,
    reason,
    refund_required
)
VALUES (
    :rideId!::uuid,
    :cancelledBy!::uuid,
    :reason,
    :refundRequired!
)
RETURNING
    id,
    ride_id,
    cancelled_by,
    reason,
    refund_required,
    created_at;

/* @name GetRideCancellationByRideId */
SELECT
    id,
    ride_id,
    cancelled_by,
    reason,
    refund_required,
    created_at
FROM ride_cancellations
WHERE ride_id = :rideId!::uuid
LIMIT 1;
