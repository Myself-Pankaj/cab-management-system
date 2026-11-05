/* @name CreateVerification */
INSERT INTO user_verifications (
    user_id,
    purpose,
    target,
    otp_hash,
    attempts,
    max_attempts,
    is_used,
    expires_at
)
VALUES (
    :userId!,
    :purpose!::verification_purpose,
    :target!,
    :otpHash!,
    :attempts!,
    :maxAttempts!,
    :isUsed!,
    :expiresAt!
)
RETURNING
    id,
    user_id,
    purpose,
    target,
    otp_hash,
    attempts,
    max_attempts,
    is_used,
    expires_at,
    used_at,
    created_at;

/* @name GetActiveVerification */
SELECT
    id,
    user_id,
    purpose,
    target,
    otp_hash,
    attempts,
    max_attempts,
    is_used,
    expires_at,
    used_at,
    created_at
FROM user_verifications
WHERE user_id = :userId!
  AND purpose = :purpose!::verification_purpose
  AND target = :target!
  AND is_used = false
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;

/* @name MarkVerificationUsed */
UPDATE user_verifications
SET is_used = true,
    used_at = NOW()
WHERE id = :id!
  AND is_used = false;

/* @name IncrementVerificationAttempts */
UPDATE user_verifications
SET attempts = attempts + 1
WHERE id = :id!;

/* @name DeleteActiveVerification */
UPDATE user_verifications
SET is_used = true,
    used_at = NOW()
WHERE user_id = :userId!
  AND purpose = :purpose!::verification_purpose
  AND target = :target!
  AND is_used = false;

/* @name DeleteUsedOrExpiredVerifications */
DELETE FROM user_verifications
WHERE is_used = TRUE
   OR expires_at < NOW();
