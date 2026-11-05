-- +migrate Up

CREATE TABLE driver_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    status review_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_driver_verifications_profile_id ON driver_verifications (driver_profile_id);
CREATE INDEX idx_driver_verifications_status ON driver_verifications (status);
CREATE INDEX idx_driver_verifications_submitted_at ON driver_verifications (submitted_at DESC);

-- +migrate Down

DROP INDEX IF EXISTS idx_driver_verifications_submitted_at;
DROP INDEX IF EXISTS idx_driver_verifications_status;
DROP INDEX IF EXISTS idx_driver_verifications_profile_id;
DROP TABLE IF EXISTS driver_verifications;
