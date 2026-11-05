/** Types generated for queries found in "db/queries/rides/vehicle_fare_rates.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

/** 'ListActiveFareRates' parameters type */
export type IListActiveFareRatesParams = void;

/** 'ListActiveFareRates' return type */
export interface IListActiveFareRatesResult {
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  display_name: string;
  is_active: boolean;
  min_fare_inr: string;
  per_km_rate_inr: string;
  updated_at: Date;
}

/** 'ListActiveFareRates' query type */
export interface IListActiveFareRatesQuery {
  params: IListActiveFareRatesParams;
  result: IListActiveFareRatesResult;
}

const listActiveFareRatesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    category,\n    display_name,\n    base_fare_inr,\n    per_km_rate_inr,\n    min_fare_inr,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicle_fare_rates\nWHERE is_active = TRUE\nORDER BY category"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     category,
 *     display_name,
 *     base_fare_inr,
 *     per_km_rate_inr,
 *     min_fare_inr,
 *     is_active,
 *     created_at,
 *     updated_at
 * FROM vehicle_fare_rates
 * WHERE is_active = TRUE
 * ORDER BY category
 * ```
 */
export const listActiveFareRates = new PreparedQuery<IListActiveFareRatesParams,IListActiveFareRatesResult>(listActiveFareRatesIR);


/** 'GetFareRateByCategory' parameters type */
export interface IGetFareRateByCategoryParams {
  category: vehicle_category;
}

/** 'GetFareRateByCategory' return type */
export interface IGetFareRateByCategoryResult {
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  display_name: string;
  is_active: boolean;
  min_fare_inr: string;
  per_km_rate_inr: string;
  updated_at: Date;
}

/** 'GetFareRateByCategory' query type */
export interface IGetFareRateByCategoryQuery {
  params: IGetFareRateByCategoryParams;
  result: IGetFareRateByCategoryResult;
}

const getFareRateByCategoryIR: any = {"usedParamSet":{"category":true},"params":[{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":193}]}],"statement":"SELECT\n    category,\n    display_name,\n    base_fare_inr,\n    per_km_rate_inr,\n    min_fare_inr,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicle_fare_rates\nWHERE category = :category!::vehicle_category\n  AND is_active = TRUE\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     category,
 *     display_name,
 *     base_fare_inr,
 *     per_km_rate_inr,
 *     min_fare_inr,
 *     is_active,
 *     created_at,
 *     updated_at
 * FROM vehicle_fare_rates
 * WHERE category = :category!::vehicle_category
 *   AND is_active = TRUE
 * LIMIT 1
 * ```
 */
export const getFareRateByCategory = new PreparedQuery<IGetFareRateByCategoryParams,IGetFareRateByCategoryResult>(getFareRateByCategoryIR);


