-- +migrate Up

CREATE TABLE ride_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    old_status ride_status,
    new_status ride_status NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_status_history_ride_id ON ride_status_history (ride_id);
CREATE INDEX idx_ride_status_history_created_at ON ride_status_history (created_at DESC);

-- +migrate Down

DROP INDEX IF EXISTS idx_ride_status_history_created_at;
DROP INDEX IF EXISTS idx_ride_status_history_ride_id;
DROP TABLE IF EXISTS ride_status_history;
