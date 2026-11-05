-- +migrate Up

CREATE TABLE driver_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL UNIQUE REFERENCES driver_profiles(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc VARCHAR(20) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    razorpay_fund_account_id VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER driver_bank_accounts_update_timestamp
BEFORE UPDATE ON driver_bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_driver_bank_accounts_profile_id ON driver_bank_accounts (driver_profile_id);

-- +migrate Down

DROP TRIGGER IF EXISTS driver_bank_accounts_update_timestamp ON driver_bank_accounts;
DROP INDEX IF EXISTS idx_driver_bank_accounts_profile_id;
DROP TABLE IF EXISTS driver_bank_accounts;
