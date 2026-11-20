/* @name CreateVehicleDocument */
INSERT INTO vehicle_documents (
    vehicle_id,
    document_type,
    document_number,
    expiry_date,
    status
)
VALUES (
    :vehicleId!::uuid,
    :documentType!::vehicle_document_type,
    :documentNumber,
    :expiryDate,
    COALESCE(:status::review_status, 'PENDING'::review_status)
)
RETURNING
    id,
    vehicle_id,
    document_type,
    document_number,
    expiry_date,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction;

/* @name ListVehicleDocumentsByVehicleId */
SELECT
    id,
    vehicle_id,
    document_type,
    document_number,
    expiry_date,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction
FROM vehicle_documents
WHERE vehicle_id = :vehicleId!::uuid
ORDER BY uploaded_at DESC;

/* @name GetVehicleDocumentById */
SELECT
    id,
    vehicle_id,
    document_type,
    document_number,
    expiry_date,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction
FROM vehicle_documents
WHERE id = :id!::uuid
LIMIT 1;

/* @name UpdateVehicleDocumentReview */
UPDATE vehicle_documents
SET
    status = :status!::review_status,
    rejection_reason = :rejectionReason,
    reviewed_at = NOW(),
    revision = revision + 1,
    correction = :correction::jsonb
WHERE id = :id!::uuid
RETURNING
    id,
    vehicle_id,
    document_type,
    document_number,
    expiry_date,
    status,
    rejection_reason,
    uploaded_at,
    reviewed_at,
    revision,
    correction;

/* @name SaveVehicleDocumentState */
UPDATE vehicle_documents SET
 document_number=:documentNumber,
 expiry_date=:expiryDate::date,
 status=:status!::review_status,
 rejection_reason=:rejectionReason,
 correction=:correction::jsonb,
 reviewed_at=CASE WHEN :status!::review_status='REJECTED' THEN reviewed_at ELSE NULL END,
 revision=revision+1
WHERE id=:id!::uuid AND revision=:expectedRevision!::integer
RETURNING *;
