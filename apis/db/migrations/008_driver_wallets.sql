-- +migrate Up

CREATE TABLE driver_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL UNIQUE REFERENCES driver_profiles(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER driver_wallets_update_timestamp
BEFORE UPDATE ON driver_wallets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_driver_wallets_profile_id ON driver_wallets (driver_profile_id);

-- +migrate Down

DROP TRIGGER IF EXISTS driver_wallets_update_timestamp ON driver_wallets;
DROP INDEX IF EXISTS idx_driver_wallets_profile_id;
DROP TABLE IF EXISTS driver_wallets;
