-- +migrate Up

CREATE TYPE vehicle_document_type AS ENUM (
    'RC',
    'PUC',
    'INSURANCE',
    'PERMIT',
    'OTHER'
);

CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type vehicle_document_type NOT NULL,
    document_number VARCHAR(100),
    expiry_date DATE,
    status review_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_vehicle_documents_vehicle_id ON vehicle_documents (vehicle_id);
CREATE INDEX idx_vehicle_documents_status ON vehicle_documents (status);

-- +migrate Down

DROP INDEX IF EXISTS idx_vehicle_documents_status;
DROP INDEX IF EXISTS idx_vehicle_documents_vehicle_id;
DROP TABLE IF EXISTS vehicle_documents;
DROP TYPE IF EXISTS vehicle_document_type;
