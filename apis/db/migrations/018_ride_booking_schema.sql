-- +migrate Up

CREATE TYPE vehicle_category AS ENUM (
    'SEATER_4',
    'SEATER_5',
    'SEATER_7',
    'SEATER_12'
);

CREATE TABLE vehicle_fare_rates (
    category vehicle_category PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    base_fare_inr NUMERIC(12, 2) NOT NULL,
    per_km_rate_inr NUMERIC(12, 2) NOT NULL,
    min_fare_inr NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER vehicle_fare_rates_update_timestamp
BEFORE UPDATE ON vehicle_fare_rates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

INSERT INTO vehicle_fare_rates (category, display_name, base_fare_inr, per_km_rate_inr, min_fare_inr)
VALUES
    ('SEATER_4', '4 Seater', 50.00, 12.00, 100.00),
    ('SEATER_5', '5 Seater', 60.00, 14.00, 120.00),
    ('SEATER_7', '7 Seater', 80.00, 18.00, 150.00),
    ('SEATER_12', '12 Seater', 120.00, 22.00, 200.00);

ALTER TABLE rides RENAME COLUMN passenger_id TO booked_by_user_id;
ALTER INDEX idx_rides_passenger_id RENAME TO idx_rides_booked_by_user_id;

ALTER TABLE rides
    ADD COLUMN requested_vehicle_category vehicle_category,
    ADD COLUMN passenger_count INTEGER NOT NULL DEFAULT 1;

UPDATE rides SET requested_vehicle_category = 'SEATER_4' WHERE requested_vehicle_category IS NULL;

ALTER TABLE rides
    ALTER COLUMN requested_vehicle_category SET NOT NULL;

CREATE INDEX idx_rides_requested_vehicle_category ON rides (requested_vehicle_category);

CREATE TABLE ride_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_passengers_ride_id ON ride_passengers (ride_id);

ALTER TABLE vehicles
    ALTER COLUMN vehicle_type TYPE vehicle_category
    USING CASE
        WHEN vehicle_type IN ('SEATER_4', 'SEATER_5', 'SEATER_7', 'SEATER_12')
            THEN vehicle_type::vehicle_category
        ELSE NULL
    END;

CREATE UNIQUE INDEX uq_payments_provider_payment_id
    ON payments (provider_payment_id)
    WHERE provider_payment_id IS NOT NULL;

CREATE UNIQUE INDEX uq_payments_provider_order_id
    ON payments (provider_order_id)
    WHERE provider_order_id IS NOT NULL;

CREATE TABLE payment_webhook_events (
    event_id VARCHAR(100) PRIMARY KEY,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down

DROP TABLE IF EXISTS payment_webhook_events;
DROP INDEX IF EXISTS uq_payments_provider_order_id;
DROP INDEX IF EXISTS uq_payments_provider_payment_id;
ALTER TABLE vehicles
    ALTER COLUMN vehicle_type TYPE VARCHAR(50)
    USING vehicle_type::text;
DROP INDEX IF EXISTS idx_ride_passengers_ride_id;
DROP TABLE IF EXISTS ride_passengers;
DROP INDEX IF EXISTS idx_rides_requested_vehicle_category;
ALTER TABLE rides
    DROP COLUMN IF EXISTS passenger_count,
    DROP COLUMN IF EXISTS requested_vehicle_category;
ALTER INDEX IF EXISTS idx_rides_booked_by_user_id RENAME TO idx_rides_passenger_id;
ALTER TABLE rides RENAME COLUMN booked_by_user_id TO passenger_id;
DROP TRIGGER IF EXISTS vehicle_fare_rates_update_timestamp ON vehicle_fare_rates;
DROP TABLE IF EXISTS vehicle_fare_rates;
DROP TYPE IF EXISTS vehicle_category;
