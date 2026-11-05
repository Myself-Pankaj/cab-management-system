/** Types generated for queries found in "db/queries/rides/payments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type payment_status = 'CANCELLED' | 'CREATED' | 'FAILED' | 'PAID' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';

export type payment_type = 'OFFLINE' | 'ONLINE';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'CreatePayment' parameters type */
export interface ICreatePaymentParams {
  amount: NumberOrString;
  currency: string;
  paymentType: payment_type;
  provider?: string | null | void;
  providerOrderId?: string | null | void;
  rideId: string;
  status: payment_status;
  userId: string;
}

/** 'CreatePayment' return type */
export interface ICreatePaymentResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'CreatePayment' query type */
export interface ICreatePaymentQuery {
  params: ICreatePaymentParams;
  result: ICreatePaymentResult;
}

const createPaymentIR: any = {"usedParamSet":{"rideId":true,"userId":true,"paymentType":true,"amount":true,"currency":true,"provider":true,"providerOrderId":true,"status":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":163}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":183}]},{"name":"paymentType","required":true,"transform":{"type":"scalar"},"locs":[{"a":196,"b":208}]},{"name":"amount","required":true,"transform":{"type":"scalar"},"locs":[{"a":229,"b":236}]},{"name":"currency","required":true,"transform":{"type":"scalar"},"locs":[{"a":243,"b":252}]},{"name":"provider","required":false,"transform":{"type":"scalar"},"locs":[{"a":259,"b":267}]},{"name":"providerOrderId","required":false,"transform":{"type":"scalar"},"locs":[{"a":274,"b":289}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":296,"b":303}]}],"statement":"INSERT INTO payments (\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    status\n)\nVALUES (\n    :rideId!::uuid,\n    :userId!::uuid,\n    :paymentType!::payment_type,\n    :amount!,\n    :currency!,\n    :provider,\n    :providerOrderId,\n    :status!::payment_status\n)\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO payments (
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     status
 * )
 * VALUES (
 *     :rideId!::uuid,
 *     :userId!::uuid,
 *     :paymentType!::payment_type,
 *     :amount!,
 *     :currency!,
 *     :provider,
 *     :providerOrderId,
 *     :status!::payment_status
 * )
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const createPayment = new PreparedQuery<ICreatePaymentParams,ICreatePaymentResult>(createPaymentIR);


/** 'ListPaymentsByRideId' parameters type */
export interface IListPaymentsByRideIdParams {
  rideId: string;
}

/** 'ListPaymentsByRideId' return type */
export interface IListPaymentsByRideIdResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'ListPaymentsByRideId' query type */
export interface IListPaymentsByRideIdQuery {
  params: IListPaymentsByRideIdParams;
  result: IListPaymentsByRideIdResult;
}

const listPaymentsByRideIdIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":true,"transform":{"type":"scalar"},"locs":[{"a":268,"b":275}]}],"statement":"SELECT\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at\nFROM payments\nWHERE ride_id = :rideId!::uuid\nORDER BY created_at ASC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * FROM payments
 * WHERE ride_id = :rideId!::uuid
 * ORDER BY created_at ASC
 * ```
 */
export const listPaymentsByRideId = new PreparedQuery<IListPaymentsByRideIdParams,IListPaymentsByRideIdResult>(listPaymentsByRideIdIR);


/** 'GetPaymentById' parameters type */
export interface IGetPaymentByIdParams {
  id: string;
}

/** 'GetPaymentById' return type */
export interface IGetPaymentByIdResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'GetPaymentById' query type */
export interface IGetPaymentByIdQuery {
  params: IGetPaymentByIdParams;
  result: IGetPaymentByIdResult;
}

const getPaymentByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":266}]}],"statement":"SELECT\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at\nFROM payments\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * FROM payments
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getPaymentById = new PreparedQuery<IGetPaymentByIdParams,IGetPaymentByIdResult>(getPaymentByIdIR);


/** 'GetPaymentByProviderOrderId' parameters type */
export interface IGetPaymentByProviderOrderIdParams {
  providerOrderId: string;
}

/** 'GetPaymentByProviderOrderId' return type */
export interface IGetPaymentByProviderOrderIdResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'GetPaymentByProviderOrderId' query type */
export interface IGetPaymentByProviderOrderIdQuery {
  params: IGetPaymentByProviderOrderIdParams;
  result: IGetPaymentByProviderOrderIdResult;
}

const getPaymentByProviderOrderIdIR: any = {"usedParamSet":{"providerOrderId":true},"params":[{"name":"providerOrderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":278,"b":294}]}],"statement":"SELECT\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at\nFROM payments\nWHERE provider_order_id = :providerOrderId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * FROM payments
 * WHERE provider_order_id = :providerOrderId!
 * LIMIT 1
 * ```
 */
export const getPaymentByProviderOrderId = new PreparedQuery<IGetPaymentByProviderOrderIdParams,IGetPaymentByProviderOrderIdResult>(getPaymentByProviderOrderIdIR);


/** 'GetPaymentByProviderPaymentId' parameters type */
export interface IGetPaymentByProviderPaymentIdParams {
  providerPaymentId: string;
}

/** 'GetPaymentByProviderPaymentId' return type */
export interface IGetPaymentByProviderPaymentIdResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'GetPaymentByProviderPaymentId' query type */
export interface IGetPaymentByProviderPaymentIdQuery {
  params: IGetPaymentByProviderPaymentIdParams;
  result: IGetPaymentByProviderPaymentIdResult;
}

const getPaymentByProviderPaymentIdIR: any = {"usedParamSet":{"providerPaymentId":true},"params":[{"name":"providerPaymentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":280,"b":298}]}],"statement":"SELECT\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at\nFROM payments\nWHERE provider_payment_id = :providerPaymentId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * FROM payments
 * WHERE provider_payment_id = :providerPaymentId!
 * LIMIT 1
 * ```
 */
export const getPaymentByProviderPaymentId = new PreparedQuery<IGetPaymentByProviderPaymentIdParams,IGetPaymentByProviderPaymentIdResult>(getPaymentByProviderPaymentIdIR);


/** 'UpdatePaymentProviderOrder' parameters type */
export interface IUpdatePaymentProviderOrderParams {
  id: string;
  provider: string;
  providerOrderId: string;
  status: payment_status;
}

/** 'UpdatePaymentProviderOrder' return type */
export interface IUpdatePaymentProviderOrderResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'UpdatePaymentProviderOrder' query type */
export interface IUpdatePaymentProviderOrderQuery {
  params: IUpdatePaymentProviderOrderParams;
  result: IUpdatePaymentProviderOrderResult;
}

const updatePaymentProviderOrderIR: any = {"usedParamSet":{"provider":true,"providerOrderId":true,"status":true,"id":true},"params":[{"name":"provider","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":44}]},{"name":"providerOrderId","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":87}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":110}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":142}]}],"statement":"UPDATE payments\nSET\n    provider = :provider!,\n    provider_order_id = :providerOrderId!,\n    status = :status!::payment_status\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE payments
 * SET
 *     provider = :provider!,
 *     provider_order_id = :providerOrderId!,
 *     status = :status!::payment_status
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const updatePaymentProviderOrder = new PreparedQuery<IUpdatePaymentProviderOrderParams,IUpdatePaymentProviderOrderResult>(updatePaymentProviderOrderIR);


/** 'MarkPaymentPaid' parameters type */
export interface IMarkPaymentPaidParams {
  id: string;
  paymentMethod?: string | null | void;
  providerPaymentId?: string | null | void;
}

/** 'MarkPaymentPaid' return type */
export interface IMarkPaymentPaidResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'MarkPaymentPaid' query type */
export interface IMarkPaymentPaidQuery {
  params: IMarkPaymentPaidParams;
  result: IMarkPaymentPaidResult;
}

const markPaymentPaidIR: any = {"usedParamSet":{"providerPaymentId":true,"paymentMethod":true,"id":true},"params":[{"name":"providerPaymentId","required":false,"transform":{"type":"scalar"},"locs":[{"a":67,"b":84}]},{"name":"paymentMethod","required":false,"transform":{"type":"scalar"},"locs":[{"a":108,"b":121}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":167,"b":170}]}],"statement":"UPDATE payments\nSET\n    status = 'PAID',\n    provider_payment_id = :providerPaymentId,\n    payment_method = :paymentMethod,\n    paid_at = CURRENT_TIMESTAMP\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE payments
 * SET
 *     status = 'PAID',
 *     provider_payment_id = :providerPaymentId,
 *     payment_method = :paymentMethod,
 *     paid_at = CURRENT_TIMESTAMP
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const markPaymentPaid = new PreparedQuery<IMarkPaymentPaidParams,IMarkPaymentPaidResult>(markPaymentPaidIR);


/** 'MarkPaymentFailed' parameters type */
export interface IMarkPaymentFailedParams {
  id: string;
}

/** 'MarkPaymentFailed' return type */
export interface IMarkPaymentFailedResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'MarkPaymentFailed' query type */
export interface IMarkPaymentFailedQuery {
  params: IMarkPaymentFailedParams;
  result: IMarkPaymentFailedResult;
}

const markPaymentFailedIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":91}]}],"statement":"UPDATE payments\nSET\n    status = 'FAILED',\n    failed_at = CURRENT_TIMESTAMP\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE payments
 * SET
 *     status = 'FAILED',
 *     failed_at = CURRENT_TIMESTAMP
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const markPaymentFailed = new PreparedQuery<IMarkPaymentFailedParams,IMarkPaymentFailedResult>(markPaymentFailedIR);


/** 'MarkPaymentRefunded' parameters type */
export interface IMarkPaymentRefundedParams {
  id: string;
  status: payment_status;
}

/** 'MarkPaymentRefunded' return type */
export interface IMarkPaymentRefundedResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'MarkPaymentRefunded' query type */
export interface IMarkPaymentRefundedQuery {
  params: IMarkPaymentRefundedParams;
  result: IMarkPaymentRefundedResult;
}

const markPaymentRefundedIR: any = {"usedParamSet":{"status":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":29,"b":36}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":68}]}],"statement":"UPDATE payments\nSET status = :status!::payment_status\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE payments
 * SET status = :status!::payment_status
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const markPaymentRefunded = new PreparedQuery<IMarkPaymentRefundedParams,IMarkPaymentRefundedResult>(markPaymentRefundedIR);


/** 'MarkOfflinePaymentPaid' parameters type */
export interface IMarkOfflinePaymentPaidParams {
  id: string;
}

/** 'MarkOfflinePaymentPaid' return type */
export interface IMarkOfflinePaymentPaidResult {
  amount: string;
  created_at: Date;
  currency: string;
  failed_at: Date | null;
  id: string;
  paid_at: Date | null;
  payment_method: string | null;
  payment_type: payment_type;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  ride_id: string;
  status: payment_status;
  updated_at: Date;
  user_id: string;
}

/** 'MarkOfflinePaymentPaid' query type */
export interface IMarkOfflinePaymentPaidQuery {
  params: IMarkOfflinePaymentPaidParams;
  result: IMarkOfflinePaymentPaidResult;
}

const markOfflinePaymentPaidIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":87}]}],"statement":"UPDATE payments\nSET\n    status = 'PAID',\n    paid_at = CURRENT_TIMESTAMP\nWHERE id = :id!::uuid\n  AND payment_type = 'OFFLINE'\nRETURNING\n    id,\n    ride_id,\n    user_id,\n    payment_type,\n    amount,\n    currency,\n    provider,\n    provider_order_id,\n    provider_payment_id,\n    status,\n    payment_method,\n    paid_at,\n    failed_at,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE payments
 * SET
 *     status = 'PAID',
 *     paid_at = CURRENT_TIMESTAMP
 * WHERE id = :id!::uuid
 *   AND payment_type = 'OFFLINE'
 * RETURNING
 *     id,
 *     ride_id,
 *     user_id,
 *     payment_type,
 *     amount,
 *     currency,
 *     provider,
 *     provider_order_id,
 *     provider_payment_id,
 *     status,
 *     payment_method,
 *     paid_at,
 *     failed_at,
 *     created_at,
 *     updated_at
 * ```
 */
export const markOfflinePaymentPaid = new PreparedQuery<IMarkOfflinePaymentPaidParams,IMarkOfflinePaymentPaidResult>(markOfflinePaymentPaidIR);


/** 'InsertWebhookEvent' parameters type */
export interface IInsertWebhookEventParams {
  eventId: string;
  payload: Json;
}

/** 'InsertWebhookEvent' return type */
export interface IInsertWebhookEventResult {
  event_id: string;
}

/** 'InsertWebhookEvent' query type */
export interface IInsertWebhookEventQuery {
  params: IInsertWebhookEventParams;
  result: IInsertWebhookEventResult;
}

const insertWebhookEventIR: any = {"usedParamSet":{"eventId":true,"payload":true},"params":[{"name":"eventId","required":true,"transform":{"type":"scalar"},"locs":[{"a":63,"b":71}]},{"name":"payload","required":true,"transform":{"type":"scalar"},"locs":[{"a":74,"b":82}]}],"statement":"INSERT INTO payment_webhook_events (event_id, payload)\nVALUES (:eventId!, :payload!::jsonb)\nON CONFLICT (event_id) DO NOTHING\nRETURNING event_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO payment_webhook_events (event_id, payload)
 * VALUES (:eventId!, :payload!::jsonb)
 * ON CONFLICT (event_id) DO NOTHING
 * RETURNING event_id
 * ```
 */
export const insertWebhookEvent = new PreparedQuery<IInsertWebhookEventParams,IInsertWebhookEventResult>(insertWebhookEventIR);


