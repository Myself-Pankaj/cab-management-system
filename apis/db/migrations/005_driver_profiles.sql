-- +migrate Up

CREATE TYPE driver_profile_status AS ENUM (
    'DRAFT',
    'PENDING_VERIFICATION',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);

CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status driver_profile_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER driver_profiles_update_timestamp
BEFORE UPDATE ON driver_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_driver_profiles_status ON driver_profiles (status);
CREATE INDEX idx_driver_profiles_user_id ON driver_profiles (user_id);

-- +migrate Down

DROP TRIGGER IF EXISTS driver_profiles_update_timestamp ON driver_profiles;
DROP INDEX IF EXISTS idx_driver_profiles_user_id;
DROP INDEX IF EXISTS idx_driver_profiles_status;
DROP TABLE IF EXISTS driver_profiles;
DROP TYPE IF EXISTS driver_profile_status;
