-- +migrate Up
ALTER TABLE vehicles
 ADD COLUMN details_review_status review_status NOT NULL DEFAULT 'PENDING',
 ADD COLUMN photos_review_status review_status NOT NULL DEFAULT 'PENDING',
 ADD COLUMN details_rejection_reason TEXT,
 ADD COLUMN photos_rejection_reason TEXT,
 ADD COLUMN photos_correction_completed BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN photos_correction_baseline UUID[] NOT NULL DEFAULT '{}',
 ADD COLUMN review_revision INTEGER NOT NULL DEFAULT 0;

UPDATE vehicles v SET details_review_status='APPROVED', photos_review_status='APPROVED'
 FROM driver_profiles p WHERE p.id=v.driver_profile_id AND p.status='APPROVED';

-- Restore correction selection for previously rejected documents with saved instructions.
WITH rejected AS (
 SELECT driver_profile_id, id, rejection_reason FROM driver_documents
 WHERE status='REJECTED' AND correction IS NOT NULL
 UNION ALL
 SELECT v.driver_profile_id, d.id, d.rejection_reason FROM vehicle_documents d
 JOIN vehicles v ON v.id=d.vehicle_id WHERE d.status='REJECTED' AND d.correction IS NOT NULL
), grouped AS (
 SELECT driver_profile_id, array_agg(id) ids, max(rejection_reason) reason FROM rejected GROUP BY driver_profile_id
)
INSERT INTO driver_verifications(driver_profile_id,status,correction_document_ids,rejection_reason,reviewed_at)
 SELECT g.driver_profile_id,'REJECTED',g.ids,g.reason,NOW() FROM grouped g
 JOIN driver_profiles p ON p.id=g.driver_profile_id WHERE p.status<>'DRAFT';

-- Previously optional uploads may still be pending on an approved profile.
-- Reopen review so admins can approve them through the normal pending-review flow.
INSERT INTO driver_verifications(driver_profile_id,status)
 SELECT p.id,'PENDING' FROM driver_profiles p
 WHERE p.status='APPROVED'
 AND NOT EXISTS(SELECT 1 FROM (
   SELECT status FROM driver_verifications WHERE driver_profile_id=p.id
   ORDER BY submitted_at DESC,id DESC LIMIT 1
 ) latest WHERE latest.status<>'APPROVED')
 AND EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=p.id AND d.status='PENDING'
   AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id));

-- +migrate Down
-- Reconciled verification history is retained.
ALTER TABLE vehicles DROP COLUMN details_review_status, DROP COLUMN photos_review_status,
 DROP COLUMN details_rejection_reason, DROP COLUMN photos_rejection_reason,
 DROP COLUMN photos_correction_completed, DROP COLUMN photos_correction_baseline, DROP COLUMN review_revision;
