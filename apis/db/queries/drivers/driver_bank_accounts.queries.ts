/** Types generated for queries found in "db/queries/drivers/driver_bank_accounts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertDriverBankAccount' parameters type */
export interface IUpsertDriverBankAccountParams {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  driverProfileId: string;
  ifsc: string;
  razorpayFundAccountId?: string | null | void;
}

/** 'UpsertDriverBankAccount' return type */
export interface IUpsertDriverBankAccountResult {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  created_at: Date;
  driver_profile_id: string;
  id: string;
  ifsc: string;
  is_verified: boolean;
  razorpay_fund_account_id: string | null;
  updated_at: Date;
}

/** 'UpsertDriverBankAccount' query type */
export interface IUpsertDriverBankAccountQuery {
  params: IUpsertDriverBankAccountParams;
  result: IUpsertDriverBankAccountResult;
}

const upsertDriverBankAccountIR: any = {"usedParamSet":{"driverProfileId":true,"accountHolderName":true,"accountNumber":true,"ifsc":true,"bankName":true,"razorpayFundAccountId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":188}]},{"name":"accountHolderName","required":true,"transform":{"type":"scalar"},"locs":[{"a":201,"b":219}]},{"name":"accountNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":240}]},{"name":"ifsc","required":true,"transform":{"type":"scalar"},"locs":[{"a":247,"b":252}]},{"name":"bankName","required":true,"transform":{"type":"scalar"},"locs":[{"a":259,"b":268}]},{"name":"razorpayFundAccountId","required":false,"transform":{"type":"scalar"},"locs":[{"a":275,"b":296}]}],"statement":"INSERT INTO driver_bank_accounts (\n    driver_profile_id,\n    account_holder_name,\n    account_number,\n    ifsc,\n    bank_name,\n    razorpay_fund_account_id\n)\nVALUES (\n    :driverProfileId!::uuid,\n    :accountHolderName!,\n    :accountNumber!,\n    :ifsc!,\n    :bankName!,\n    :razorpayFundAccountId\n)\nON CONFLICT (driver_profile_id) DO UPDATE SET\n    account_holder_name = EXCLUDED.account_holder_name,\n    account_number = EXCLUDED.account_number,\n    ifsc = EXCLUDED.ifsc,\n    bank_name = EXCLUDED.bank_name,\n    razorpay_fund_account_id = EXCLUDED.razorpay_fund_account_id,\n    is_verified = FALSE,\n    updated_at = NOW()\nRETURNING\n    id,\n    driver_profile_id,\n    account_holder_name,\n    account_number,\n    ifsc,\n    bank_name,\n    razorpay_fund_account_id,\n    is_verified,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_bank_accounts (
 *     driver_profile_id,
 *     account_holder_name,
 *     account_number,
 *     ifsc,
 *     bank_name,
 *     razorpay_fund_account_id
 * )
 * VALUES (
 *     :driverProfileId!::uuid,
 *     :accountHolderName!,
 *     :accountNumber!,
 *     :ifsc!,
 *     :bankName!,
 *     :razorpayFundAccountId
 * )
 * ON CONFLICT (driver_profile_id) DO UPDATE SET
 *     account_holder_name = EXCLUDED.account_holder_name,
 *     account_number = EXCLUDED.account_number,
 *     ifsc = EXCLUDED.ifsc,
 *     bank_name = EXCLUDED.bank_name,
 *     razorpay_fund_account_id = EXCLUDED.razorpay_fund_account_id,
 *     is_verified = FALSE,
 *     updated_at = NOW()
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     account_holder_name,
 *     account_number,
 *     ifsc,
 *     bank_name,
 *     razorpay_fund_account_id,
 *     is_verified,
 *     created_at,
 *     updated_at
 * ```
 */
export const upsertDriverBankAccount = new PreparedQuery<IUpsertDriverBankAccountParams,IUpsertDriverBankAccountResult>(upsertDriverBankAccountIR);


/** 'GetDriverBankAccountByProfileId' parameters type */
export interface IGetDriverBankAccountByProfileIdParams {
  driverProfileId: string;
}

/** 'GetDriverBankAccountByProfileId' return type */
export interface IGetDriverBankAccountByProfileIdResult {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  created_at: Date;
  driver_profile_id: string;
  id: string;
  ifsc: string;
  is_verified: boolean;
  razorpay_fund_account_id: string | null;
  updated_at: Date;
}

/** 'GetDriverBankAccountByProfileId' query type */
export interface IGetDriverBankAccountByProfileIdQuery {
  params: IGetDriverBankAccountByProfileIdParams;
  result: IGetDriverBankAccountByProfileIdResult;
}

const getDriverBankAccountByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":238,"b":254}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    account_holder_name,\n    account_number,\n    ifsc,\n    bank_name,\n    razorpay_fund_account_id,\n    is_verified,\n    created_at,\n    updated_at\nFROM driver_bank_accounts\nWHERE driver_profile_id = :driverProfileId!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     account_holder_name,
 *     account_number,
 *     ifsc,
 *     bank_name,
 *     razorpay_fund_account_id,
 *     is_verified,
 *     created_at,
 *     updated_at
 * FROM driver_bank_accounts
 * WHERE driver_profile_id = :driverProfileId!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverBankAccountByProfileId = new PreparedQuery<IGetDriverBankAccountByProfileIdParams,IGetDriverBankAccountByProfileIdResult>(getDriverBankAccountByProfileIdIR);


