/* @name CreatePayment */
INSERT INTO payments (
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    status
)
VALUES (
    :rideId!::uuid,
    :userId!::uuid,
    :paymentType!::payment_type,
    :amount!,
    :currency!,
    :provider,
    :providerOrderId,
    :status!::payment_status
)
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name ListPaymentsByRideId */
SELECT
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at
FROM payments
WHERE ride_id = :rideId!::uuid
ORDER BY created_at ASC;

/* @name GetPaymentById */
SELECT
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at
FROM payments
WHERE id = :id!::uuid
LIMIT 1;

/* @name GetPaymentByProviderOrderId */
SELECT
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at
FROM payments
WHERE provider_order_id = :providerOrderId!
LIMIT 1;

/* @name GetPaymentByProviderPaymentId */
SELECT
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at
FROM payments
WHERE provider_payment_id = :providerPaymentId!
LIMIT 1;

/* @name UpdatePaymentProviderOrder */
UPDATE payments
SET
    provider = :provider!,
    provider_order_id = :providerOrderId!,
    status = :status!::payment_status
WHERE id = :id!::uuid
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name MarkPaymentPaid */
UPDATE payments
SET
    status = 'PAID',
    provider_payment_id = :providerPaymentId,
    payment_method = :paymentMethod,
    paid_at = CURRENT_TIMESTAMP
WHERE id = :id!::uuid
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name MarkPaymentFailed */
UPDATE payments
SET
    status = 'FAILED',
    failed_at = CURRENT_TIMESTAMP
WHERE id = :id!::uuid
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name MarkPaymentRefunded */
UPDATE payments
SET status = :status!::payment_status
WHERE id = :id!::uuid
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name MarkOfflinePaymentPaid */
UPDATE payments
SET
    status = 'PAID',
    paid_at = CURRENT_TIMESTAMP
WHERE id = :id!::uuid
  AND payment_type = 'OFFLINE'
RETURNING
    id,
    ride_id,
    user_id,
    payment_type,
    amount,
    currency,
    provider,
    provider_order_id,
    provider_payment_id,
    status,
    payment_method,
    paid_at,
    failed_at,
    created_at,
    updated_at;

/* @name InsertWebhookEvent */
INSERT INTO payment_webhook_events (event_id, payload)
VALUES (:eventId!, :payload!::jsonb)
ON CONFLICT (event_id) DO NOTHING
RETURNING event_id;
