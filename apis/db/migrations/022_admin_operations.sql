-- +migrate Up
CREATE TABLE admin_mutations (
 actor_id UUID NOT NULL REFERENCES users(id), operation_id UUID NOT NULL,
 action TEXT NOT NULL, request_hash TEXT NOT NULL, response JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(actor_id, operation_id)
);
CREATE TABLE vehicle_edit_audit (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), vehicle_id UUID NOT NULL REFERENCES vehicles(id),
 actor_id UUID NOT NULL REFERENCES users(id), reason TEXT, before_values JSONB NOT NULL,
 after_values JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER vehicle_audit_immutable BEFORE UPDATE OR DELETE ON vehicle_edit_audit
 FOR EACH ROW EXECUTE FUNCTION prevent_driver_audit_change();
ALTER TABLE ride_offers ADD COLUMN identity_snapshot JSONB;
ALTER TABLE ride_completions ADD COLUMN identity_snapshot JSONB;
CREATE FUNCTION capture_ride_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_TABLE_NAME='ride_offers' THEN
 SELECT jsonb_build_object('driver_name',u.full_name,'vehicle_number',v.vehicle_number,'vehicle_category',v.vehicle_type)
 INTO NEW.identity_snapshot FROM driver_profiles p JOIN users u ON u.id=p.user_id
 JOIN vehicles v ON v.id=NEW.vehicle_id WHERE p.id=NEW.driver_profile_id;
 ELSE
 SELECT identity_snapshot INTO NEW.identity_snapshot FROM ride_offers
 WHERE ride_id=NEW.ride_id AND driver_profile_id=NEW.driver_profile_id AND status='ACCEPTED'
 AND released_at IS NULL AND cancelled_at IS NULL ORDER BY created_at DESC,id DESC LIMIT 1;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER ride_offer_identity BEFORE INSERT ON ride_offers FOR EACH ROW EXECUTE FUNCTION capture_ride_identity();
CREATE TRIGGER ride_completion_identity BEFORE INSERT ON ride_completions FOR EACH ROW EXECUTE FUNCTION capture_ride_identity();
-- Millisecond-monotonic tokens survive JavaScript Date serialization.
CREATE FUNCTION vehicle_edit_timestamp() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at=GREATEST(date_trunc('milliseconds',clock_timestamp()),OLD.updated_at+INTERVAL '1 millisecond'); RETURN NEW; END $$;
DROP TRIGGER vehicles_update_timestamp ON vehicles;
CREATE TRIGGER vehicles_update_timestamp BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION vehicle_edit_timestamp();
-- +migrate Down
DROP TRIGGER vehicles_update_timestamp ON vehicles;
CREATE TRIGGER vehicles_update_timestamp BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP FUNCTION vehicle_edit_timestamp();
DROP TRIGGER ride_completion_identity ON ride_completions;
DROP TRIGGER ride_offer_identity ON ride_offers;
DROP FUNCTION capture_ride_identity();
ALTER TABLE ride_completions DROP COLUMN identity_snapshot;
ALTER TABLE ride_offers DROP COLUMN identity_snapshot;
DROP TABLE vehicle_edit_audit;
DROP TABLE admin_mutations;
