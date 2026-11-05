-- +migrate Up

CREATE TABLE ride_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    cancelled_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    refund_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_cancellations_ride_id ON ride_cancellations (ride_id);

-- +migrate Down

DROP INDEX IF EXISTS idx_ride_cancellations_ride_id;
DROP TABLE IF EXISTS ride_cancellations;
