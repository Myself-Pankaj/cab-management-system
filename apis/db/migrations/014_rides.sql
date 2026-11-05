-- +migrate Up

CREATE TYPE trip_type AS ENUM (
    'ONE_WAY',
    'ROUND_TRIP'
);

CREATE TYPE ride_status AS ENUM (
    'PENDING_PAYMENT',
    'PAYMENT_FAILED',
    'PENDING_ASSIGNMENT',
    'DRIVER_ASSIGNED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE payment_option AS ENUM (
    'ONLINE',
    'OFFLINE',
    'PARTIAL'
);

CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    trip_type trip_type NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_exact_location TEXT,
    pickup_latitude NUMERIC(10, 7) NOT NULL,
    pickup_longitude NUMERIC(10, 7) NOT NULL,
    destination_address TEXT NOT NULL,
    exact_destination TEXT,
    destination_latitude NUMERIC(10, 7) NOT NULL,
    destination_longitude NUMERIC(10, 7) NOT NULL,
    distance_km NUMERIC(10, 2) NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    pickup_at TIMESTAMPTZ NOT NULL,
    return_at TIMESTAMPTZ,
    estimated_fare NUMERIC(12, 2) NOT NULL,
    final_fare NUMERIC(12, 2),
    payment_option payment_option NOT NULL,
    status ride_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER rides_update_timestamp
BEFORE UPDATE ON rides
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_rides_passenger_id ON rides (passenger_id);
CREATE INDEX idx_rides_driver_profile_id ON rides (driver_profile_id);
CREATE INDEX idx_rides_vehicle_id ON rides (vehicle_id);
CREATE INDEX idx_rides_status ON rides (status);
CREATE INDEX idx_rides_pickup_at ON rides (pickup_at);

-- +migrate Down

DROP TRIGGER IF EXISTS rides_update_timestamp ON rides;
DROP INDEX IF EXISTS idx_rides_pickup_at;
DROP INDEX IF EXISTS idx_rides_status;
DROP INDEX IF EXISTS idx_rides_vehicle_id;
DROP INDEX IF EXISTS idx_rides_driver_profile_id;
DROP INDEX IF EXISTS idx_rides_passenger_id;
DROP TABLE IF EXISTS rides;
DROP TYPE IF EXISTS payment_option;
DROP TYPE IF EXISTS ride_status;
DROP TYPE IF EXISTS trip_type;
