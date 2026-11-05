-- +migrate Up

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50),
    make VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    manufacturing_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER vehicles_update_timestamp
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_vehicles_profile_id ON vehicles (driver_profile_id);
CREATE INDEX idx_vehicles_active ON vehicles (driver_profile_id, is_active);

-- +migrate Down

DROP TRIGGER IF EXISTS vehicles_update_timestamp ON vehicles;
DROP INDEX IF EXISTS idx_vehicles_active;
DROP INDEX IF EXISTS idx_vehicles_profile_id;
DROP TABLE IF EXISTS vehicles;
