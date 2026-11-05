/** Types generated for queries found in "db/queries/drivers/driver_wallets.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateDriverWallet' parameters type */
export interface ICreateDriverWalletParams {
  driverProfileId: string;
}

/** 'CreateDriverWallet' return type */
export interface ICreateDriverWalletResult {
  balance: string;
  created_at: Date;
  currency: string;
  driver_profile_id: string;
  id: string;
  updated_at: Date;
}

/** 'CreateDriverWallet' query type */
export interface ICreateDriverWalletQuery {
  params: ICreateDriverWalletParams;
  result: ICreateDriverWalletResult;
}

const createDriverWalletIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":71}]}],"statement":"INSERT INTO driver_wallets (driver_profile_id)\nVALUES (:driverProfileId!::uuid)\nRETURNING\n    id,\n    driver_profile_id,\n    balance,\n    currency,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO driver_wallets (driver_profile_id)
 * VALUES (:driverProfileId!::uuid)
 * RETURNING
 *     id,
 *     driver_profile_id,
 *     balance,
 *     currency,
 *     created_at,
 *     updated_at
 * ```
 */
export const createDriverWallet = new PreparedQuery<ICreateDriverWalletParams,ICreateDriverWalletResult>(createDriverWalletIR);


/** 'GetDriverWalletByProfileId' parameters type */
export interface IGetDriverWalletByProfileIdParams {
  driverProfileId: string;
}

/** 'GetDriverWalletByProfileId' return type */
export interface IGetDriverWalletByProfileIdResult {
  balance: string;
  created_at: Date;
  currency: string;
  driver_profile_id: string;
  id: string;
  updated_at: Date;
}

/** 'GetDriverWalletByProfileId' query type */
export interface IGetDriverWalletByProfileIdQuery {
  params: IGetDriverWalletByProfileIdParams;
  result: IGetDriverWalletByProfileIdResult;
}

const getDriverWalletByProfileIdIR: any = {"usedParamSet":{"driverProfileId":true},"params":[{"name":"driverProfileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":158}]}],"statement":"SELECT\n    id,\n    driver_profile_id,\n    balance,\n    currency,\n    created_at,\n    updated_at\nFROM driver_wallets\nWHERE driver_profile_id = :driverProfileId!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     driver_profile_id,
 *     balance,
 *     currency,
 *     created_at,
 *     updated_at
 * FROM driver_wallets
 * WHERE driver_profile_id = :driverProfileId!::uuid
 * LIMIT 1
 * ```
 */
export const getDriverWalletByProfileId = new PreparedQuery<IGetDriverWalletByProfileIdParams,IGetDriverWalletByProfileIdResult>(getDriverWalletByProfileIdIR);


