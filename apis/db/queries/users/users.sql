/* @name CreateUser */
INSERT INTO users (
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    timezone,
    language,
    metadata
)
VALUES (
    :firstName,
    :lastName,
    :fullName!,
    :email,
    :phoneNumber,
    :passwordHash,
    :authProvider!::auth_provider,
    :globalRole::global_role,
    :emailVerified!,
    :phoneVerified!,
    :isActive!,
    :isBlocked!,
    :timezone!,
    :language!,
    :metadata!
)
RETURNING
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at;

/* @name GetUserByID */
SELECT
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at
FROM users
WHERE id = :id!
  AND deleted_at IS NULL
LIMIT 1;

/* @name GetUserByEmail */
SELECT
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at
FROM users
WHERE LOWER(email) = LOWER(:email!)
  AND deleted_at IS NULL
LIMIT 1;

/* @name GetUserByPhoneNumber */
SELECT
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at
FROM users
WHERE phone_number = :phoneNumber!
  AND deleted_at IS NULL
LIMIT 1;

/* @name EmailExists */
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE LOWER(email) = LOWER(:email!)
      AND deleted_at IS NULL
) AS "exists!";

/* @name PhoneExists */
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE phone_number = :phoneNumber!
      AND deleted_at IS NULL
) AS "exists!";

/* @name MarkEmailVerified */
UPDATE users
SET
    email_verified = TRUE,
    updated_at = NOW()
WHERE id = :id!;

/* @name UpdateUserPasswordHash */
UPDATE users
SET
    password_hash = :passwordHash!,
    password_changed_at = NOW(),
    updated_at = NOW()
WHERE id = :id!
  AND deleted_at IS NULL;

/* @name UpdateUserLastLogin */
UPDATE users
SET
    last_login_at = NOW(),
    updated_at = NOW()
WHERE id = :id!
  AND deleted_at IS NULL;

/* @name UpdateUserProfile */
UPDATE users
SET
    first_name = COALESCE(:firstName, first_name),
    last_name = COALESCE(:lastName, last_name),
    full_name = TRIM(BOTH FROM CONCAT(
        COALESCE(:firstName, first_name, ''),
        ' ',
        COALESCE(:lastName, last_name, '')
    )),
    phone_number = COALESCE(:phoneNumber, phone_number),
    date_of_birth = COALESCE(:dateOfBirth, date_of_birth),
    gender = COALESCE(:gender, gender),
    timezone = COALESCE(:timezone, timezone),
    language = COALESCE(:language, language),
    updated_at = NOW()
WHERE id = :id!
  AND deleted_at IS NULL
RETURNING
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at;

/* @name UpdateUserRole */
UPDATE users
SET
    global_role = :globalRole!::global_role,
    updated_at = NOW()
WHERE id = :id!
  AND deleted_at IS NULL
  AND global_role IS NULL
RETURNING
    id,
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    password_hash,
    auth_provider,
    provider_id,
    global_role,
    email_verified,
    phone_verified,
    is_active,
    is_blocked,
    blocked_reason,
    avatar_url,
    date_of_birth,
    gender,
    timezone,
    language,
    last_login_at,
    password_changed_at,
    deleted_at,
    metadata,
    created_at,
    updated_at;
