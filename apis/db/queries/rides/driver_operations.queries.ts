/** Types generated for queries found in "db/queries/rides/driver_operations.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type driver_profile_status = 'APPROVED' | 'DRAFT' | 'PENDING_VERIFICATION' | 'REJECTED' | 'SUSPENDED';

export type payment_option = 'OFFLINE' | 'ONLINE' | 'PARTIAL';

export type review_status = 'APPROVED' | 'PENDING' | 'REJECTED';

export type ride_offer_status = 'ACCEPTED' | 'EXPIRED' | 'PENDING' | 'REJECTED' | 'REVOKED';

export type ride_status = 'CANCELLED' | 'COMPLETED' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'IN_PROGRESS' | 'PAYMENT_FAILED' | 'PENDING_ASSIGNMENT' | 'PENDING_PAYMENT';

export type trip_type = 'ONE_WAY' | 'ROUND_TRIP';

export type vehicle_category = 'SEATER_12' | 'SEATER_4' | 'SEATER_5' | 'SEATER_7';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

export type stringArray = (string)[];

/** 'LockDriverForRides' parameters type */
export interface ILockDriverForRidesParams {
  profileId?: string | null | void;
}

/** 'LockDriverForRides' return type */
export interface ILockDriverForRidesResult {
  created_at: Date;
  id: string;
  status: driver_profile_status;
  updated_at: Date;
  user_id: string;
}

/** 'LockDriverForRides' query type */
export interface ILockDriverForRidesQuery {
  params: ILockDriverForRidesParams;
  result: ILockDriverForRidesResult;
}

const lockDriverForRidesIR: any = {"usedParamSet":{"profileId":true},"params":[{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":48}]}],"statement":"SELECT * FROM driver_profiles WHERE id=:profileId FOR UPDATE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM driver_profiles WHERE id=:profileId FOR UPDATE
 * ```
 */
export const lockDriverForRides = new PreparedQuery<ILockDriverForRidesParams,ILockDriverForRidesResult>(lockDriverForRidesIR);


/** 'LockVehicleForRides' parameters type */
export interface ILockVehicleForRidesParams {
  vehicleId?: string | null | void;
}

/** 'LockVehicleForRides' return type */
export interface ILockVehicleForRidesResult {
  color: string | null;
  created_at: Date;
  details_rejection_reason: string | null;
  details_review_status: review_status;
  driver_profile_id: string;
  id: string;
  is_active: boolean;
  make: string | null;
  manufacturing_year: number | null;
  model: string | null;
  photos_correction_baseline: stringArray;
  photos_correction_completed: boolean;
  photos_rejection_reason: string | null;
  photos_review_status: review_status;
  review_revision: number;
  updated_at: Date;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'LockVehicleForRides' query type */
export interface ILockVehicleForRidesQuery {
  params: ILockVehicleForRidesParams;
  result: ILockVehicleForRidesResult;
}

const lockVehicleForRidesIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":32,"b":41}]}],"statement":"SELECT * FROM vehicles WHERE id=:vehicleId FOR UPDATE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM vehicles WHERE id=:vehicleId FOR UPDATE
 * ```
 */
export const lockVehicleForRides = new PreparedQuery<ILockVehicleForRidesParams,ILockVehicleForRidesResult>(lockVehicleForRidesIR);


/** 'LockOperationalRide' parameters type */
export interface ILockOperationalRideParams {
  rideId?: string | null | void;
}

/** 'LockOperationalRide' return type */
export interface ILockOperationalRideResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'LockOperationalRide' query type */
export interface ILockOperationalRideQuery {
  params: ILockOperationalRideParams;
  result: ILockOperationalRideResult;
}

const lockOperationalRideIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":29,"b":35}]}],"statement":"SELECT * FROM rides WHERE id=:rideId FOR UPDATE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM rides WHERE id=:rideId FOR UPDATE
 * ```
 */
export const lockOperationalRide = new PreparedQuery<ILockOperationalRideParams,ILockOperationalRideResult>(lockOperationalRideIR);


/** 'ListRideOffers' parameters type */
export interface IListRideOffersParams {
  rideId?: string | null | void;
}

/** 'ListRideOffers' return type */
export interface IListRideOffersResult {
  assigned_by: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  driver_profile_id: string;
  expires_at: Date;
  id: string;
  identity_snapshot: Json | null;
  reason: string | null;
  release_reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  responded_at: Date | null;
  ride_id: string;
  status: ride_offer_status;
  vehicle_id: string;
}

/** 'ListRideOffers' query type */
export interface IListRideOffersQuery {
  params: IListRideOffersParams;
  result: IListRideOffersResult;
}

const listRideOffersIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":46}]}],"statement":"SELECT * FROM ride_offers WHERE ride_id=:rideId ORDER BY created_at DESC,id DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM ride_offers WHERE ride_id=:rideId ORDER BY created_at DESC,id DESC
 * ```
 */
export const listRideOffers = new PreparedQuery<IListRideOffersParams,IListRideOffersResult>(listRideOffersIR);


/** 'GetRideOffer' parameters type */
export interface IGetRideOfferParams {
  offerId?: string | null | void;
}

/** 'GetRideOffer' return type */
export interface IGetRideOfferResult {
  assigned_by: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  driver_profile_id: string;
  expires_at: Date;
  id: string;
  identity_snapshot: Json | null;
  reason: string | null;
  release_reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  responded_at: Date | null;
  ride_id: string;
  status: ride_offer_status;
  vehicle_id: string;
}

/** 'GetRideOffer' query type */
export interface IGetRideOfferQuery {
  params: IGetRideOfferParams;
  result: IGetRideOfferResult;
}

const getRideOfferIR: any = {"usedParamSet":{"offerId":true},"params":[{"name":"offerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":35,"b":42}]}],"statement":"SELECT * FROM ride_offers WHERE id=:offerId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM ride_offers WHERE id=:offerId
 * ```
 */
export const getRideOffer = new PreparedQuery<IGetRideOfferParams,IGetRideOfferResult>(getRideOfferIR);


/** 'CreateRideOffer' parameters type */
export interface ICreateRideOfferParams {
  adminId?: string | null | void;
  expiresAt?: DateOrString | null | void;
  profileId?: string | null | void;
  rideId?: string | null | void;
  vehicleId?: string | null | void;
}

/** 'CreateRideOffer' return type */
export interface ICreateRideOfferResult {
  assigned_by: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  driver_profile_id: string;
  expires_at: Date;
  id: string;
  identity_snapshot: Json | null;
  reason: string | null;
  release_reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  responded_at: Date | null;
  ride_id: string;
  status: ride_offer_status;
  vehicle_id: string;
}

/** 'CreateRideOffer' query type */
export interface ICreateRideOfferQuery {
  params: ICreateRideOfferParams;
  result: ICreateRideOfferResult;
}

const createRideOfferIR: any = {"usedParamSet":{"rideId":true,"profileId":true,"vehicleId":true,"adminId":true,"expiresAt":true},"params":[{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":92,"b":98}]},{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":100,"b":109}]},{"name":"vehicleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":111,"b":120}]},{"name":"adminId","required":false,"transform":{"type":"scalar"},"locs":[{"a":122,"b":129}]},{"name":"expiresAt","required":false,"transform":{"type":"scalar"},"locs":[{"a":131,"b":140}]}],"statement":"INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,assigned_by,expires_at) VALUES(:rideId,:profileId,:vehicleId,:adminId,:expiresAt) RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,assigned_by,expires_at) VALUES(:rideId,:profileId,:vehicleId,:adminId,:expiresAt) RETURNING *
 * ```
 */
export const createRideOffer = new PreparedQuery<ICreateRideOfferParams,ICreateRideOfferResult>(createRideOfferIR);


/** 'RespondToRideOffer' parameters type */
export interface IRespondToRideOfferParams {
  offerId?: string | null | void;
  reason?: string | null | void;
  status?: ride_offer_status | null | void;
}

/** 'RespondToRideOffer' return type */
export interface IRespondToRideOfferResult {
  assigned_by: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  driver_profile_id: string;
  expires_at: Date;
  id: string;
  identity_snapshot: Json | null;
  reason: string | null;
  release_reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  responded_at: Date | null;
  ride_id: string;
  status: ride_offer_status;
  vehicle_id: string;
}

/** 'RespondToRideOffer' query type */
export interface IRespondToRideOfferQuery {
  params: IRespondToRideOfferParams;
  result: IRespondToRideOfferResult;
}

const respondToRideOfferIR: any = {"usedParamSet":{"status":true,"reason":true,"offerId":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":30,"b":36}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":45,"b":51}]},{"name":"offerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]}],"statement":"UPDATE ride_offers SET status=:status,reason=:reason,responded_at=NOW() WHERE id=:offerId RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE ride_offers SET status=:status,reason=:reason,responded_at=NOW() WHERE id=:offerId RETURNING *
 * ```
 */
export const respondToRideOffer = new PreparedQuery<IRespondToRideOfferParams,IRespondToRideOfferResult>(respondToRideOfferIR);


/** 'ReleaseRideOffer' parameters type */
export interface IReleaseRideOfferParams {
  actorId?: string | null | void;
  offerId?: string | null | void;
  reason?: string | null | void;
}

/** 'ReleaseRideOffer' return type */
export type IReleaseRideOfferResult = void;

/** 'ReleaseRideOffer' query type */
export interface IReleaseRideOfferQuery {
  params: IReleaseRideOfferParams;
  result: IReleaseRideOfferResult;
}

const releaseRideOfferIR: any = {"usedParamSet":{"actorId":true,"reason":true,"offerId":true},"params":[{"name":"actorId","required":false,"transform":{"type":"scalar"},"locs":[{"a":53,"b":60}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":77,"b":83}]},{"name":"offerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":94,"b":101}]}],"statement":"UPDATE ride_offers SET released_at=NOW(),released_by=:actorId,release_reason=:reason WHERE id=:offerId"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE ride_offers SET released_at=NOW(),released_by=:actorId,release_reason=:reason WHERE id=:offerId
 * ```
 */
export const releaseRideOffer = new PreparedQuery<IReleaseRideOfferParams,IReleaseRideOfferResult>(releaseRideOfferIR);


/** 'CancelRideOffers' parameters type */
export interface ICancelRideOffersParams {
  actorId?: string | null | void;
  reason?: string | null | void;
  rideId?: string | null | void;
}

/** 'CancelRideOffers' return type */
export type ICancelRideOffersResult = void;

/** 'CancelRideOffers' query type */
export interface ICancelRideOffersQuery {
  params: ICancelRideOffersParams;
  result: ICancelRideOffersResult;
}

const cancelRideOffersIR: any = {"usedParamSet":{"actorId":true,"reason":true,"rideId":true},"params":[{"name":"actorId","required":false,"transform":{"type":"scalar"},"locs":[{"a":138,"b":145}]},{"name":"reason","required":false,"transform":{"type":"scalar"},"locs":[{"a":162,"b":168}]},{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":184,"b":190}]}],"statement":"UPDATE ride_offers SET status=CASE WHEN status='PENDING' THEN 'REVOKED'::ride_offer_status ELSE status END,cancelled_at=NOW(),released_by=:actorId,release_reason=:reason WHERE ride_id=:rideId AND status IN ('PENDING','ACCEPTED') AND released_at IS NULL AND cancelled_at IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE ride_offers SET status=CASE WHEN status='PENDING' THEN 'REVOKED'::ride_offer_status ELSE status END,cancelled_at=NOW(),released_by=:actorId,release_reason=:reason WHERE ride_id=:rideId AND status IN ('PENDING','ACCEPTED') AND released_at IS NULL AND cancelled_at IS NULL
 * ```
 */
export const cancelRideOffers = new PreparedQuery<ICancelRideOffersParams,ICancelRideOffersResult>(cancelRideOffersIR);


/** 'ClearRideAssignment' parameters type */
export interface IClearRideAssignmentParams {
  rideId?: string | null | void;
}

/** 'ClearRideAssignment' return type */
export type IClearRideAssignmentResult = void;

/** 'ClearRideAssignment' query type */
export interface IClearRideAssignmentQuery {
  params: IClearRideAssignmentParams;
  result: IClearRideAssignmentResult;
}

const clearRideAssignmentIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":133}]}],"statement":"UPDATE rides SET status='PENDING_ASSIGNMENT',driver_profile_id=NULL,vehicle_id=NULL,assigned_by=NULL,assigned_at=NULL WHERE id=:rideId"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rides SET status='PENDING_ASSIGNMENT',driver_profile_id=NULL,vehicle_id=NULL,assigned_by=NULL,assigned_at=NULL WHERE id=:rideId
 * ```
 */
export const clearRideAssignment = new PreparedQuery<IClearRideAssignmentParams,IClearRideAssignmentResult>(clearRideAssignmentIR);


/** 'ListResourceReservations' parameters type */
export interface IListResourceReservationsParams {
  excludeRideId?: string | null | void;
  profileId?: string | null | void;
  vehicleId?: string | null | void;
}

/** 'ListResourceReservations' return type */
export interface IListResourceReservationsResult {
  assigned_at: Date | null;
  assigned_by: string | null;
  bag_count: number;
  booked_by_user_id: string;
  booking_key: string | null;
  booking_payload_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  cancelled_by: string | null;
  created_at: Date;
  destination_address: string;
  destination_latitude: string;
  destination_longitude: string;
  distance_km: string;
  driver_profile_id: string | null;
  estimated_duration_minutes: number;
  estimated_fare: string;
  exact_destination: string | null;
  final_fare: string | null;
  id: string;
  passenger_count: number;
  payment_option: payment_option;
  pickup_address: string;
  pickup_at: Date;
  pickup_exact_location: string | null;
  pickup_latitude: string;
  pickup_longitude: string;
  requested_vehicle_category: vehicle_category;
  return_at: Date | null;
  special_requests: string | null;
  status: ride_status;
  trip_type: trip_type;
  updated_at: Date;
  vehicle_id: string | null;
}

/** 'ListResourceReservations' query type */
export interface IListResourceReservationsQuery {
  params: IListResourceReservationsParams;
  result: IListResourceReservationsResult;
}

const listResourceReservationsIR: any = {"usedParamSet":{"excludeRideId":true,"profileId":true,"vehicleId":true},"params":[{"name":"excludeRideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":36,"b":49}]},{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":76,"b":85}]},{"name":"vehicleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":112}]}],"statement":"SELECT r.* FROM rides r WHERE r.id<>:excludeRideId AND (r.driver_profile_id=:profileId OR r.vehicle_id=:vehicleId)\n      AND (r.status IN ('CONFIRMED','IN_PROGRESS') OR (r.status='DRIVER_ASSIGNED' AND EXISTS (\n      SELECT 1 FROM ride_offers o WHERE o.ride_id=r.id AND o.status='PENDING' AND o.expires_at>NOW() AND o.released_at IS NULL AND o.cancelled_at IS NULL)))"};

/**
 * Query generated from SQL:
 * ```
 * SELECT r.* FROM rides r WHERE r.id<>:excludeRideId AND (r.driver_profile_id=:profileId OR r.vehicle_id=:vehicleId)
 *       AND (r.status IN ('CONFIRMED','IN_PROGRESS') OR (r.status='DRIVER_ASSIGNED' AND EXISTS (
 *       SELECT 1 FROM ride_offers o WHERE o.ride_id=r.id AND o.status='PENDING' AND o.expires_at>NOW() AND o.released_at IS NULL AND o.cancelled_at IS NULL)))
 * ```
 */
export const listResourceReservations = new PreparedQuery<IListResourceReservationsParams,IListResourceReservationsResult>(listResourceReservationsIR);


/** 'LockDriverEligibilityDocuments' parameters type */
export interface ILockDriverEligibilityDocumentsParams {
  profileId?: string | null | void;
}

/** 'LockDriverEligibilityDocuments' return type */
export interface ILockDriverEligibilityDocumentsResult {
  id: string;
}

/** 'LockDriverEligibilityDocuments' query type */
export interface ILockDriverEligibilityDocumentsQuery {
  params: ILockDriverEligibilityDocumentsParams;
  result: ILockDriverEligibilityDocumentsResult;
}

const lockDriverEligibilityDocumentsIR: any = {"usedParamSet":{"profileId":true},"params":[{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":56,"b":65}]}],"statement":"SELECT id FROM driver_documents WHERE driver_profile_id=:profileId ORDER BY id FOR UPDATE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id FROM driver_documents WHERE driver_profile_id=:profileId ORDER BY id FOR UPDATE
 * ```
 */
export const lockDriverEligibilityDocuments = new PreparedQuery<ILockDriverEligibilityDocumentsParams,ILockDriverEligibilityDocumentsResult>(lockDriverEligibilityDocumentsIR);


/** 'LockVehicleEligibilityDocuments' parameters type */
export interface ILockVehicleEligibilityDocumentsParams {
  vehicleId?: string | null | void;
}

/** 'LockVehicleEligibilityDocuments' return type */
export interface ILockVehicleEligibilityDocumentsResult {
  id: string;
}

/** 'LockVehicleEligibilityDocuments' query type */
export interface ILockVehicleEligibilityDocumentsQuery {
  params: ILockVehicleEligibilityDocumentsParams;
  result: ILockVehicleEligibilityDocumentsResult;
}

const lockVehicleEligibilityDocumentsIR: any = {"usedParamSet":{"vehicleId":true},"params":[{"name":"vehicleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":50,"b":59}]}],"statement":"SELECT id FROM vehicle_documents WHERE vehicle_id=:vehicleId ORDER BY id FOR UPDATE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id FROM vehicle_documents WHERE vehicle_id=:vehicleId ORDER BY id FOR UPDATE
 * ```
 */
export const lockVehicleEligibilityDocuments = new PreparedQuery<ILockVehicleEligibilityDocumentsParams,ILockVehicleEligibilityDocumentsResult>(lockVehicleEligibilityDocumentsIR);


/** 'CheckApprovedDriverDocuments' parameters type */
export interface ICheckApprovedDriverDocumentsParams {
  profileId?: string | null | void;
  vehicleId?: string | null | void;
}

/** 'CheckApprovedDriverDocuments' return type */
export interface ICheckApprovedDriverDocumentsResult {
  eligible: boolean | null;
}

/** 'CheckApprovedDriverDocuments' query type */
export interface ICheckApprovedDriverDocumentsQuery {
  params: ICheckApprovedDriverDocumentsParams;
  result: ICheckApprovedDriverDocumentsResult;
}

const checkApprovedDriverDocumentsIR: any = {"usedParamSet":{"profileId":true,"vehicleId":true},"params":[{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":112},{"a":286,"b":295},{"a":539,"b":548},{"a":880,"b":889}]},{"name":"vehicleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":251,"b":260},{"a":767,"b":776},{"a":1295,"b":1304}]}],"statement":"SELECT\n      NOT EXISTS(SELECT 1 FROM (SELECT status FROM driver_verifications WHERE driver_profile_id=:profileId ORDER BY submitted_at DESC,id DESC LIMIT 1) latest WHERE latest.status<>'APPROVED')\n      AND EXISTS(SELECT 1 FROM vehicles v WHERE v.id=:vehicleId AND v.driver_profile_id=:profileId AND v.details_review_status='APPROVED' AND v.photos_review_status='APPROVED' AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE' AND i.owner_id=v.id))\n      AND NOT EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.status<>'APPROVED' AND (d.status='REJECTED' OR EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id)))\n      AND NOT EXISTS(SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.status<>'APPROVED')\n      AND EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.document_type='DRIVING_LICENCE' AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id AND i.document_private))\n      AND NOT EXISTS(SELECT 1 FROM unnest(ARRAY['RC','PUC','INSURANCE']) required(kind) WHERE NOT EXISTS(\n        SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.document_type::text=required.kind AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE_DOCUMENT' AND i.owner_id=d.id AND i.document_private))) AS eligible"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *       NOT EXISTS(SELECT 1 FROM (SELECT status FROM driver_verifications WHERE driver_profile_id=:profileId ORDER BY submitted_at DESC,id DESC LIMIT 1) latest WHERE latest.status<>'APPROVED')
 *       AND EXISTS(SELECT 1 FROM vehicles v WHERE v.id=:vehicleId AND v.driver_profile_id=:profileId AND v.details_review_status='APPROVED' AND v.photos_review_status='APPROVED' AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE' AND i.owner_id=v.id))
 *       AND NOT EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.status<>'APPROVED' AND (d.status='REJECTED' OR EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id)))
 *       AND NOT EXISTS(SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.status<>'APPROVED')
 *       AND EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.document_type='DRIVING_LICENCE' AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id AND i.document_private))
 *       AND NOT EXISTS(SELECT 1 FROM unnest(ARRAY['RC','PUC','INSURANCE']) required(kind) WHERE NOT EXISTS(
 *         SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.document_type::text=required.kind AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE_DOCUMENT' AND i.owner_id=d.id AND i.document_private))) AS eligible
 * ```
 */
export const checkApprovedDriverDocuments = new PreparedQuery<ICheckApprovedDriverDocumentsParams,ICheckApprovedDriverDocumentsResult>(checkApprovedDriverDocumentsIR);


/** 'ListApprovedDriverVehicles' parameters type */
export type IListApprovedDriverVehiclesParams = void;

/** 'ListApprovedDriverVehicles' return type */
export interface IListApprovedDriverVehiclesResult {
  driver_profile_id: string;
  full_name: string;
  vehicle_id: string;
  vehicle_number: string;
  vehicle_type: vehicle_category | null;
}

/** 'ListApprovedDriverVehicles' query type */
export interface IListApprovedDriverVehiclesQuery {
  params: IListApprovedDriverVehiclesParams;
  result: IListApprovedDriverVehiclesResult;
}

const listApprovedDriverVehiclesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT p.id driver_profile_id,v.id vehicle_id,v.vehicle_number,v.vehicle_type,u.full_name FROM driver_profiles p JOIN vehicles v ON v.driver_profile_id=p.id JOIN users u ON u.id=p.user_id WHERE p.status='APPROVED' AND v.is_active ORDER BY u.full_name,v.vehicle_number"};

/**
 * Query generated from SQL:
 * ```
 * SELECT p.id driver_profile_id,v.id vehicle_id,v.vehicle_number,v.vehicle_type,u.full_name FROM driver_profiles p JOIN vehicles v ON v.driver_profile_id=p.id JOIN users u ON u.id=p.user_id WHERE p.status='APPROVED' AND v.is_active ORDER BY u.full_name,v.vehicle_number
 * ```
 */
export const listApprovedDriverVehicles = new PreparedQuery<IListApprovedDriverVehiclesParams,IListApprovedDriverVehiclesResult>(listApprovedDriverVehiclesIR);


/** 'ListDriverRideOffers' parameters type */
export interface IListDriverRideOffersParams {
  limit?: NumberOrString | null | void;
  offset?: NumberOrString | null | void;
  profileId?: string | null | void;
  view?: string | null | void;
}

/** 'ListDriverRideOffers' return type */
export interface IListDriverRideOffersResult {
  assigned_by: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  current_driver_profile_id: string | null;
  destination_address: string;
  driver_profile_id: string;
  expires_at: Date;
  id: string;
  identity_snapshot: Json | null;
  pickup_address: string;
  pickup_at: Date;
  reason: string | null;
  release_reason: string | null;
  released_at: Date | null;
  released_by: string | null;
  responded_at: Date | null;
  ride_id: string;
  ride_status: ride_status;
  status: ride_offer_status;
  total: string | null;
  vehicle_id: string;
}

/** 'ListDriverRideOffers' query type */
export interface IListDriverRideOffersQuery {
  params: IListDriverRideOffersParams;
  result: IListDriverRideOffersResult;
}

const listDriverRideOffersIR: any = {"usedParamSet":{"profileId":true,"view":true,"limit":true,"offset":true},"params":[{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":227,"b":236}]},{"name":"view","required":false,"transform":{"type":"scalar"},"locs":[{"a":251,"b":255},{"a":409,"b":413},{"a":556,"b":560},{"a":660,"b":664},{"a":720,"b":724},{"a":772,"b":776}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":833,"b":838}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":847,"b":853}]}],"statement":"SELECT o.*,r.status ride_status,r.pickup_at,r.pickup_address,r.destination_address,r.driver_profile_id current_driver_profile_id,COUNT(*) OVER() total FROM ride_offers o JOIN rides r ON r.id=o.ride_id WHERE o.driver_profile_id=:profileId AND (\n      (:view='assigned' AND o.status='PENDING' AND o.expires_at>NOW() AND r.status='DRIVER_ASSIGNED' AND o.released_at IS NULL AND o.cancelled_at IS NULL)\n      OR (:view='active' AND o.status='ACCEPTED' AND r.status IN ('CONFIRMED','IN_PROGRESS') AND o.released_at IS NULL AND o.cancelled_at IS NULL)\n      OR (:view='completed' AND o.status='ACCEPTED' AND o.released_at IS NULL AND r.status='COMPLETED')\n      OR (:view='cancelled' AND o.cancelled_at IS NOT NULL)\n      OR (:view='rejected' AND o.status='REJECTED')\n      OR (:view='history')) ORDER BY o.created_at DESC,o.id DESC LIMIT :limit OFFSET :offset"};

/**
 * Query generated from SQL:
 * ```
 * SELECT o.*,r.status ride_status,r.pickup_at,r.pickup_address,r.destination_address,r.driver_profile_id current_driver_profile_id,COUNT(*) OVER() total FROM ride_offers o JOIN rides r ON r.id=o.ride_id WHERE o.driver_profile_id=:profileId AND (
 *       (:view='assigned' AND o.status='PENDING' AND o.expires_at>NOW() AND r.status='DRIVER_ASSIGNED' AND o.released_at IS NULL AND o.cancelled_at IS NULL)
 *       OR (:view='active' AND o.status='ACCEPTED' AND r.status IN ('CONFIRMED','IN_PROGRESS') AND o.released_at IS NULL AND o.cancelled_at IS NULL)
 *       OR (:view='completed' AND o.status='ACCEPTED' AND o.released_at IS NULL AND r.status='COMPLETED')
 *       OR (:view='cancelled' AND o.cancelled_at IS NOT NULL)
 *       OR (:view='rejected' AND o.status='REJECTED')
 *       OR (:view='history')) ORDER BY o.created_at DESC,o.id DESC LIMIT :limit OFFSET :offset
 * ```
 */
export const listDriverRideOffers = new PreparedQuery<IListDriverRideOffersParams,IListDriverRideOffersResult>(listDriverRideOffersIR);


/** 'GetRideCompletion' parameters type */
export interface IGetRideCompletionParams {
  rideId?: string | null | void;
}

/** 'GetRideCompletion' return type */
export interface IGetRideCompletionResult {
  created_at: Date;
  declared_by: string;
  declared_cash: string;
  driver_profile_id: string;
  id: string;
  identity_snapshot: Json | null;
  note: string | null;
  payment_id: string | null;
  ride_id: string;
}

/** 'GetRideCompletion' query type */
export interface IGetRideCompletionQuery {
  params: IGetRideCompletionParams;
  result: IGetRideCompletionResult;
}

const getRideCompletionIR: any = {"usedParamSet":{"rideId":true},"params":[{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":45,"b":51}]}],"statement":"SELECT * FROM ride_completions WHERE ride_id=:rideId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM ride_completions WHERE ride_id=:rideId
 * ```
 */
export const getRideCompletion = new PreparedQuery<IGetRideCompletionParams,IGetRideCompletionResult>(getRideCompletionIR);


/** 'RecordRideCompletion' parameters type */
export interface IRecordRideCompletionParams {
  actorId?: string | null | void;
  cash?: NumberOrString | null | void;
  note?: string | null | void;
  operationId?: string | null | void;
  paymentId?: string | null | void;
  profileId?: string | null | void;
  rideId?: string | null | void;
}

/** 'RecordRideCompletion' return type */
export interface IRecordRideCompletionResult {
  created_at: Date;
  declared_by: string;
  declared_cash: string;
  driver_profile_id: string;
  id: string;
  identity_snapshot: Json | null;
  note: string | null;
  payment_id: string | null;
  ride_id: string;
}

/** 'RecordRideCompletion' query type */
export interface IRecordRideCompletionQuery {
  params: IRecordRideCompletionParams;
  result: IRecordRideCompletionResult;
}

const recordRideCompletionIR: any = {"usedParamSet":{"operationId":true,"rideId":true,"profileId":true,"actorId":true,"cash":true,"paymentId":true,"note":true},"params":[{"name":"operationId","required":false,"transform":{"type":"scalar"},"locs":[{"a":108,"b":119}]},{"name":"rideId","required":false,"transform":{"type":"scalar"},"locs":[{"a":121,"b":127}]},{"name":"profileId","required":false,"transform":{"type":"scalar"},"locs":[{"a":129,"b":138}]},{"name":"actorId","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":147}]},{"name":"cash","required":false,"transform":{"type":"scalar"},"locs":[{"a":149,"b":153}]},{"name":"paymentId","required":false,"transform":{"type":"scalar"},"locs":[{"a":155,"b":164}]},{"name":"note","required":false,"transform":{"type":"scalar"},"locs":[{"a":166,"b":170}]}],"statement":"INSERT INTO ride_completions(id,ride_id,driver_profile_id,declared_by,declared_cash,payment_id,note) VALUES(:operationId,:rideId,:profileId,:actorId,:cash,:paymentId,:note) RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ride_completions(id,ride_id,driver_profile_id,declared_by,declared_cash,payment_id,note) VALUES(:operationId,:rideId,:profileId,:actorId,:cash,:paymentId,:note) RETURNING *
 * ```
 */
export const recordRideCompletion = new PreparedQuery<IRecordRideCompletionParams,IRecordRideCompletionResult>(recordRideCompletionIR);


