/* @name CreateDriverWallet */
INSERT INTO driver_wallets (driver_profile_id)
VALUES (:driverProfileId!::uuid)
RETURNING
    id,
    driver_profile_id,
    balance,
    currency,
    created_at,
    updated_at;

/* @name GetDriverWalletByProfileId */
SELECT
    id,
    driver_profile_id,
    balance,
    currency,
    created_at,
    updated_at
FROM driver_wallets
WHERE driver_profile_id = :driverProfileId!::uuid
LIMIT 1;
