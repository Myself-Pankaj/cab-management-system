/* @name CreateDriverVerification */
INSERT INTO driver_verifications (
    driver_profile_id,
    status,
    submitted_at
)
VALUES (
    :driverProfileId!::uuid,
    'PENDING'::review_status,
    NOW()
)
RETURNING
    id,
    driver_profile_id,
    status,
    reviewed_by,
    rejection_reason,
    submitted_at,
    reviewed_at;

/* @name GetLatestDriverVerificationByProfileId */
SELECT
    id,
    driver_profile_id,
    status,
    reviewed_by,
    rejection_reason,
    submitted_at,
    reviewed_at
FROM driver_verifications
WHERE driver_profile_id = :driverProfileId!::uuid
ORDER BY submitted_at DESC
LIMIT 1;

/* @name UpdateDriverVerificationReview */
UPDATE driver_verifications
SET
    status = :status!::review_status,
    reviewed_by = :reviewedBy::uuid,
    rejection_reason = :rejectionReason,
    reviewed_at = NOW()
WHERE id = :id!::uuid
RETURNING
    id,
    driver_profile_id,
    status,
    reviewed_by,
    rejection_reason,
    submitted_at,
    reviewed_at;
