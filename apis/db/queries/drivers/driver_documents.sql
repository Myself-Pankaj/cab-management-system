/* @name CreateDriverDocument */
INSERT INTO driver_documents (
    driver_profile_id,
    document_type,
    document_number,
    status
)
VALUES (
    :driverProfileId!::uuid,
    :documentType!::driver_document_type,
    :documentNumber,
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
    reviewed_at;

/* @name ListDriverDocumentsByProfileId */
SELECT
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at
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
    reviewed_at
FROM driver_documents
WHERE id = :id!::uuid
LIMIT 1;

/* @name UpdateDriverDocumentReview */
UPDATE driver_documents
SET
    status = :status!::review_status,
    rejection_reason = :rejectionReason,
    reviewed_at = NOW()
WHERE id = :id!::uuid
RETURNING
    id,
    driver_profile_id,
    document_type,
    document_number,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at;

/* @name DeleteRejectedDriverDocumentByType */
DELETE FROM driver_documents
WHERE driver_profile_id = :driverProfileId!::uuid
  AND document_type = :documentType!::driver_document_type
  AND status = 'REJECTED'::review_status;
