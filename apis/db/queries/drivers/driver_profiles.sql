/* @name CreateDriverProfile */
INSERT INTO driver_profiles (user_id, status)
VALUES (:userId!::uuid, :status!::driver_profile_status)
RETURNING
    id,
    user_id,
    status,
    created_at,
    updated_at;

/* @name GetDriverProfileByUserId */
SELECT
    id,
    user_id,
    status,
    created_at,
    updated_at
FROM driver_profiles
WHERE user_id = :userId!::uuid
LIMIT 1;

/* @name GetDriverProfileById */
SELECT
    id,
    user_id,
    status,
    created_at,
    updated_at
FROM driver_profiles
WHERE id = :id!::uuid
LIMIT 1;

/* @name ListPendingDriverProfiles */
SELECT
    id,
    user_id,
    status,
    created_at,
    updated_at
FROM driver_profiles
WHERE status = 'PENDING_VERIFICATION'::driver_profile_status
ORDER BY updated_at ASC;

/* @name UpdateDriverProfileStatus */
UPDATE driver_profiles
SET
    status = :status!::driver_profile_status,
    updated_at = NOW()
WHERE id = :id!::uuid
RETURNING
    id,
    user_id,
    status,
    created_at,
    updated_at;
