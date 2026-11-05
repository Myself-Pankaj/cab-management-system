-- +migrate Up

CREATE TYPE driver_document_type AS ENUM (
    'AADHAAR',
    'DRIVING_LICENCE',
    'POLICE_VERIFICATION',
    'PAN',
    'OTHER'
);

CREATE TYPE review_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    document_type driver_document_type NOT NULL,
    document_number VARCHAR(100),
    status review_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_driver_documents_active_type
ON driver_documents (driver_profile_id, document_type)
WHERE status != 'REJECTED';

CREATE INDEX idx_driver_documents_profile_id ON driver_documents (driver_profile_id);
CREATE INDEX idx_driver_documents_status ON driver_documents (status);

-- +migrate Down

DROP INDEX IF EXISTS idx_driver_documents_status;
DROP INDEX IF EXISTS idx_driver_documents_profile_id;
DROP INDEX IF EXISTS uq_driver_documents_active_type;
DROP TABLE IF EXISTS driver_documents;
DROP TYPE IF EXISTS review_status;
DROP TYPE IF EXISTS driver_document_type;
