/** Types generated for queries found in "db/queries/rides/vehicle_fare_rates.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

export type NumberOrString = number | string;

/** 'ListActiveFareRates' parameters type */
export type IListActiveFareRatesParams = void;

/** 'ListActiveFareRates' return type */
export interface IListActiveFareRatesResult {
  bag_capacity: number;
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  description: string;
  display_name: string;
  image_url: string | null;
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

const listActiveFareRatesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    category,\n    display_name,\n    description,\n    image_url,\n    bag_capacity,\n    base_fare_inr,\n    per_km_rate_inr,\n    min_fare_inr,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicle_fare_rates\nWHERE is_active = TRUE\nORDER BY category"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     category,
 *     display_name,
 *     description,
 *     image_url,
 *     bag_capacity,
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
  bag_capacity: number;
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  description: string;
  display_name: string;
  image_url: string | null;
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

const getFareRateByCategoryIR: any = {"usedParamSet":{"category":true},"params":[{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":234,"b":243}]}],"statement":"SELECT\n    category,\n    display_name,\n    description,\n    image_url,\n    bag_capacity,\n    base_fare_inr,\n    per_km_rate_inr,\n    min_fare_inr,\n    is_active,\n    created_at,\n    updated_at\nFROM vehicle_fare_rates\nWHERE category = :category!::vehicle_category\n  AND is_active = TRUE\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     category,
 *     display_name,
 *     description,
 *     image_url,
 *     bag_capacity,
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


/** 'ListAllFareRates' parameters type */
export type IListAllFareRatesParams = void;

/** 'ListAllFareRates' return type */
export interface IListAllFareRatesResult {
  bag_capacity: number;
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  description: string;
  display_name: string;
  image_url: string | null;
  is_active: boolean;
  min_fare_inr: string;
  per_km_rate_inr: string;
  updated_at: Date;
}

/** 'ListAllFareRates' query type */
export interface IListAllFareRatesQuery {
  params: IListAllFareRatesParams;
  result: IListAllFareRatesResult;
}

const listAllFareRatesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM vehicle_fare_rates ORDER BY category"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM vehicle_fare_rates ORDER BY category
 * ```
 */
export const listAllFareRates = new PreparedQuery<IListAllFareRatesParams,IListAllFareRatesResult>(listAllFareRatesIR);


/** 'UpdateFareCategory' parameters type */
export interface IUpdateFareCategoryParams {
  bagCapacity: number;
  baseFare: NumberOrString;
  category: vehicle_category;
  description: string;
  displayName: string;
  imageUrl?: string | null | void;
  isActive: boolean;
  minFare: NumberOrString;
  perKm: NumberOrString;
}

/** 'UpdateFareCategory' return type */
export interface IUpdateFareCategoryResult {
  bag_capacity: number;
  base_fare_inr: string;
  category: vehicle_category;
  created_at: Date;
  description: string;
  display_name: string;
  image_url: string | null;
  is_active: boolean;
  min_fare_inr: string;
  per_km_rate_inr: string;
  updated_at: Date;
}

/** 'UpdateFareCategory' query type */
export interface IUpdateFareCategoryQuery {
  params: IUpdateFareCategoryParams;
  result: IUpdateFareCategoryResult;
}

const updateFareCategoryIR: any = {"usedParamSet":{"displayName":true,"description":true,"imageUrl":true,"bagCapacity":true,"baseFare":true,"perKm":true,"minFare":true,"isActive":true,"category":true},"params":[{"name":"displayName","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":55}]},{"name":"description","required":true,"transform":{"type":"scalar"},"locs":[{"a":70,"b":82}]},{"name":"imageUrl","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":104}]},{"name":"bagCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":120,"b":132}]},{"name":"baseFare","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":158}]},{"name":"perKm","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":184}]},{"name":"minFare","required":true,"transform":{"type":"scalar"},"locs":[{"a":200,"b":208}]},{"name":"isActive","required":true,"transform":{"type":"scalar"},"locs":[{"a":221,"b":230}]},{"name":"category","required":true,"transform":{"type":"scalar"},"locs":[{"a":247,"b":256}]}],"statement":"UPDATE vehicle_fare_rates SET display_name=:displayName!, description=:description!,\n image_url=:imageUrl, bag_capacity=:bagCapacity!, base_fare_inr=:baseFare!,\n per_km_rate_inr=:perKm!, min_fare_inr=:minFare!, is_active=:isActive!\nWHERE category=:category!::vehicle_category RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE vehicle_fare_rates SET display_name=:displayName!, description=:description!,
 *  image_url=:imageUrl, bag_capacity=:bagCapacity!, base_fare_inr=:baseFare!,
 *  per_km_rate_inr=:perKm!, min_fare_inr=:minFare!, is_active=:isActive!
 * WHERE category=:category!::vehicle_category RETURNING *
 * ```
 */
export const updateFareCategory = new PreparedQuery<IUpdateFareCategoryParams,IUpdateFareCategoryResult>(updateFareCategoryIR);


