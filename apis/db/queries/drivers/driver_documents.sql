/* @name CreateDriverDocument */
INSERT INTO driver_documents (
    driver_profile_id,
    document_type,
    document_number,
    expiry_date,
    status
)
VALUES (
    :driverProfileId!::uuid,
    :documentType!::driver_document_type,
    :documentNumber,
    :expiryDate::date,
    COALESCE(:status::review_status, 'PENDING'::review_status)
)
RETURNING
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction,
    expiry_date;

/* @name ListDriverDocumentsByProfileId */
SELECT
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction,
    expiry_date
FROM driver_documents
WHERE driver_profile_id = :driverProfileId!::uuid
ORDER BY uploaded_at DESC;

/* @name GetDriverDocumentById */
SELECT
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction,
    expiry_date
FROM driver_documents
WHERE id = :id!::uuid
LIMIT 1;

/* @name UpdateDriverDocumentReview */
UPDATE driver_documents
SET
    status = :status!::review_status,
    rejection_reason = :rejectionReason,
    reviewed_at = NOW(),
    revision = revision + 1,
    correction = :correction::jsonb
WHERE id = :id!::uuid
RETURNING
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction,
    expiry_date;

/* @name DeleteRejectedDriverDocumentByType */
DELETE FROM driver_documents
WHERE driver_profile_id = :driverProfileId!::uuid
  AND document_type = :documentType!::driver_document_type
  AND status = 'REJECTED'::review_status;

/* @name SaveDriverDocumentState */
UPDATE driver_documents SET
 document_number=:documentNumber,
 expiry_date=:expiryDate::date,
 status=:status!::review_status,
 rejection_reason=:rejectionReason,
 correction=:correction::jsonb,
 reviewed_at=CASE WHEN :status!::review_status='REJECTED' THEN reviewed_at ELSE NULL END,
 revision=revision+1
WHERE id=:id!::uuid AND revision=:expectedRevision!::integer
RETURNING *;
