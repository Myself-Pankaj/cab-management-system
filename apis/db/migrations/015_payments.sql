-- +migrate Up

CREATE TYPE payment_type AS ENUM (
    'ONLINE',
    'OFFLINE'
);

CREATE TYPE payment_status AS ENUM (
    'CREATED',
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'CANCELLED'
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type payment_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    provider VARCHAR(30),
    provider_order_id VARCHAR(100),
    provider_payment_id VARCHAR(100),
    status payment_status NOT NULL DEFAULT 'CREATED',
    payment_method VARCHAR(30),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER payments_update_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_payments_ride_id ON payments (ride_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_payments_status ON payments (status);

-- +migrate Down

DROP TRIGGER IF EXISTS payments_update_timestamp ON payments;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_ride_id;
DROP TABLE IF EXISTS payments;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_type;
