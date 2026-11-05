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
    reviewed_at;

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
    reviewed_at
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
    reviewed_at
FROM vehicle_documents
WHERE id = :id!::uuid
LIMIT 1;

/* @name UpdateVehicleDocumentReview */
UPDATE vehicle_documents
SET
    status = :status!::review_status,
    rejection_reason = :rejectionReason,
    reviewed_at = NOW()
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
    reviewed_at;
