/* @name UpsertDriverBankAccount */
INSERT INTO driver_bank_accounts (
    driver_profile_id,
    account_holder_name,
    account_number,
    ifsc,
    bank_name,
    razorpay_fund_account_id
)
VALUES (
    :driverProfileId!::uuid,
    :accountHolderName!,
    :accountNumber!,
    :ifsc!,
    :bankName!,
    :razorpayFundAccountId
)
ON CONFLICT (driver_profile_id) DO UPDATE SET
    account_holder_name = EXCLUDED.account_holder_name,
    account_number = EXCLUDED.account_number,
    ifsc = EXCLUDED.ifsc,
    bank_name = EXCLUDED.bank_name,
    razorpay_fund_account_id = EXCLUDED.razorpay_fund_account_id,
    is_verified = FALSE,
    updated_at = NOW()
RETURNING
    id,
    driver_profile_id,
    account_holder_name,
    account_number,
    ifsc,
    bank_name,
    razorpay_fund_account_id,
    is_verified,
    created_at,
    updated_at;

/* @name GetDriverBankAccountByProfileId */
SELECT
    id,
    driver_profile_id,
    account_holder_name,
    account_number,
    ifsc,
    bank_name,
    razorpay_fund_account_id,
    is_verified,
    created_at,
    updated_at
FROM driver_bank_accounts
WHERE driver_profile_id = :driverProfileId!::uuid
LIMIT 1;
