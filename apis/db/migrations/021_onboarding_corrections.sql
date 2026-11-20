-- +migrate Up
ALTER TABLE driver_verifications ADD COLUMN correction_document_ids UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE driver_documents ADD COLUMN expiry_date DATE;
ALTER TABLE driver_documents ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE driver_documents ADD COLUMN correction JSONB;
ALTER TABLE vehicle_documents ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vehicle_documents ADD COLUMN correction JSONB;
ALTER TABLE driver_review_audit ADD COLUMN details JSONB;
CREATE TABLE media_cleanup_jobs (
    file_id TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    leased_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX media_cleanup_due ON media_cleanup_jobs(available_at);
-- A queued file cannot be reattached while a worker checks references/deletes it.
CREATE FUNCTION prevent_cleanup_file_attachment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.imagekit_file_id, 0));
    IF EXISTS(SELECT 1 FROM media_cleanup_jobs WHERE file_id=NEW.imagekit_file_id) THEN
        RAISE EXCEPTION 'File is scheduled for cleanup';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER images_cleanup_guard BEFORE INSERT OR UPDATE OF imagekit_file_id ON images
FOR EACH ROW EXECUTE FUNCTION prevent_cleanup_file_attachment();
-- +migrate Down
DROP TRIGGER IF EXISTS images_cleanup_guard ON images;
DROP FUNCTION IF EXISTS prevent_cleanup_file_attachment();
DROP TABLE IF EXISTS media_cleanup_jobs;
ALTER TABLE driver_verifications DROP COLUMN correction_document_ids;
ALTER TABLE driver_review_audit DROP COLUMN details;
ALTER TABLE vehicle_documents DROP COLUMN correction, DROP COLUMN revision;
ALTER TABLE driver_documents DROP COLUMN correction, DROP COLUMN revision, DROP COLUMN expiry_date;
