-- +migrate Up
CREATE TYPE ride_offer_status AS ENUM ('PENDING','ACCEPTED','REJECTED','EXPIRED','REVOKED');
CREATE TABLE ride_offers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 ride_id UUID NOT NULL REFERENCES rides(id),
 driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id),
 vehicle_id UUID NOT NULL REFERENCES vehicles(id),
 assigned_by UUID REFERENCES users(id),
 status ride_offer_status NOT NULL DEFAULT 'PENDING',
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 responded_at TIMESTAMPTZ,
 reason TEXT,
 released_at TIMESTAMPTZ,
 released_by UUID REFERENCES users(id),
 release_reason TEXT,
 cancelled_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX ride_offers_current ON ride_offers(ride_id)
 WHERE status IN ('PENDING','ACCEPTED') AND released_at IS NULL AND cancelled_at IS NULL;
CREATE INDEX ride_offers_driver ON ride_offers(driver_profile_id,created_at DESC);
CREATE INDEX ride_offers_vehicle ON ride_offers(vehicle_id);
INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,assigned_by,status,expires_at,created_at,responded_at,cancelled_at)
SELECT id,driver_profile_id,vehicle_id,assigned_by,
 CASE WHEN status='DRIVER_ASSIGNED' THEN 'PENDING'::ride_offer_status ELSE 'ACCEPTED'::ride_offer_status END,
 pickup_at,COALESCE(assigned_at,created_at),
 CASE WHEN status<>'DRIVER_ASSIGNED' THEN COALESCE(assigned_at,created_at) END,
 CASE WHEN status='CANCELLED' THEN COALESCE(cancelled_at,updated_at) END
FROM rides WHERE driver_profile_id IS NOT NULL AND vehicle_id IS NOT NULL;
CREATE TABLE ride_completions (
 id UUID PRIMARY KEY,
 ride_id UUID NOT NULL UNIQUE REFERENCES rides(id),
 driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id),
 declared_by UUID NOT NULL REFERENCES users(id),
 declared_cash NUMERIC(12,2) NOT NULL CHECK(declared_cash>=0),
 payment_id UUID REFERENCES payments(id),
 note TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE driver_review_audit (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id),
 document_id UUID,
 document_kind TEXT NOT NULL CHECK(document_kind IN ('PROFILE','DRIVER_DOCUMENT','VEHICLE_DOCUMENT')),
 decision TEXT NOT NULL,
 reason TEXT,
 reviewed_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE FUNCTION prevent_driver_audit_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Review audit is append only'; END $$;
CREATE TRIGGER driver_review_audit_immutable BEFORE UPDATE OR DELETE ON driver_review_audit
 FOR EACH ROW EXECUTE FUNCTION prevent_driver_audit_change();
ALTER TABLE images ADD COLUMN document_private BOOLEAN NOT NULL DEFAULT FALSE;
-- Existing document rows are quarantined until provider privacy is verified by the migration script.
UPDATE driver_documents SET document_number=RIGHT(regexp_replace(document_number,'[^0-9]','','g'),4)
 WHERE document_type='AADHAAR' AND document_number IS NOT NULL;
-- +migrate Down
ALTER TABLE images DROP COLUMN document_private;
DROP TABLE driver_review_audit;
DROP FUNCTION prevent_driver_audit_change();
DROP TABLE ride_completions;
DROP TABLE ride_offers;
DROP TYPE ride_offer_status;
