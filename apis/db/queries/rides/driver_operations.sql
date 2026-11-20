/* @name LockDriverForRides */
SELECT * FROM driver_profiles WHERE id=:profileId FOR UPDATE;

/* @name LockVehicleForRides */
SELECT * FROM vehicles WHERE id=:vehicleId FOR UPDATE;

/* @name LockOperationalRide */
SELECT * FROM rides WHERE id=:rideId FOR UPDATE;

/* @name ListRideOffers */
SELECT * FROM ride_offers WHERE ride_id=:rideId ORDER BY created_at DESC,id DESC;

/* @name GetRideOffer */
SELECT * FROM ride_offers WHERE id=:offerId;

/* @name CreateRideOffer */
INSERT INTO ride_offers(ride_id,driver_profile_id,vehicle_id,assigned_by,expires_at) VALUES(:rideId,:profileId,:vehicleId,:adminId,:expiresAt) RETURNING *;

/* @name RespondToRideOffer */
UPDATE ride_offers SET status=:status,reason=:reason,responded_at=NOW() WHERE id=:offerId RETURNING *;

/* @name ReleaseRideOffer */
UPDATE ride_offers SET released_at=NOW(),released_by=:actorId,release_reason=:reason WHERE id=:offerId;

/* @name CancelRideOffers */
UPDATE ride_offers SET status=CASE WHEN status='PENDING' THEN 'REVOKED'::ride_offer_status ELSE status END,cancelled_at=NOW(),released_by=:actorId,release_reason=:reason WHERE ride_id=:rideId AND status IN ('PENDING','ACCEPTED') AND released_at IS NULL AND cancelled_at IS NULL;

/* @name ClearRideAssignment */
UPDATE rides SET status='PENDING_ASSIGNMENT',driver_profile_id=NULL,vehicle_id=NULL,assigned_by=NULL,assigned_at=NULL WHERE id=:rideId;

/* @name ListResourceReservations */
SELECT r.* FROM rides r WHERE r.id<>:excludeRideId AND (r.driver_profile_id=:profileId OR r.vehicle_id=:vehicleId)
      AND (r.status IN ('CONFIRMED','IN_PROGRESS') OR (r.status='DRIVER_ASSIGNED' AND EXISTS (
      SELECT 1 FROM ride_offers o WHERE o.ride_id=r.id AND o.status='PENDING' AND o.expires_at>NOW() AND o.released_at IS NULL AND o.cancelled_at IS NULL)));

/* @name LockDriverEligibilityDocuments */
SELECT id FROM driver_documents WHERE driver_profile_id=:profileId ORDER BY id FOR UPDATE;

/* @name LockVehicleEligibilityDocuments */
SELECT id FROM vehicle_documents WHERE vehicle_id=:vehicleId ORDER BY id FOR UPDATE;

/* @name CheckApprovedDriverDocuments */
SELECT
      NOT EXISTS(SELECT 1 FROM (SELECT status FROM driver_verifications WHERE driver_profile_id=:profileId ORDER BY submitted_at DESC,id DESC LIMIT 1) latest WHERE latest.status<>'APPROVED')
      AND EXISTS(SELECT 1 FROM vehicles v WHERE v.id=:vehicleId AND v.driver_profile_id=:profileId AND v.details_review_status='APPROVED' AND v.photos_review_status='APPROVED' AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE' AND i.owner_id=v.id))
      AND NOT EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.status<>'APPROVED' AND (d.status='REJECTED' OR EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id)))
      AND NOT EXISTS(SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.status<>'APPROVED')
      AND EXISTS(SELECT 1 FROM driver_documents d WHERE d.driver_profile_id=:profileId AND d.document_type='DRIVING_LICENCE' AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='DRIVER_DOCUMENT' AND i.owner_id=d.id AND i.document_private))
      AND NOT EXISTS(SELECT 1 FROM unnest(ARRAY['RC','PUC','INSURANCE']) required(kind) WHERE NOT EXISTS(
        SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id=:vehicleId AND d.document_type::text=required.kind AND d.status='APPROVED' AND (d.expiry_date IS NULL OR d.expiry_date>=CURRENT_DATE) AND EXISTS(SELECT 1 FROM images i WHERE i.owner_type='VEHICLE_DOCUMENT' AND i.owner_id=d.id AND i.document_private))) AS eligible;

/* @name ListApprovedDriverVehicles */
SELECT p.id driver_profile_id,v.id vehicle_id,v.vehicle_number,v.vehicle_type,u.full_name FROM driver_profiles p JOIN vehicles v ON v.driver_profile_id=p.id JOIN users u ON u.id=p.user_id WHERE p.status='APPROVED' AND v.is_active ORDER BY u.full_name,v.vehicle_number;

/* @name ListDriverRideOffers */
SELECT o.*,r.status ride_status,r.pickup_at,r.pickup_address,r.destination_address,r.driver_profile_id current_driver_profile_id,COUNT(*) OVER() total FROM ride_offers o JOIN rides r ON r.id=o.ride_id WHERE o.driver_profile_id=:profileId AND (
      (:view='assigned' AND o.status='PENDING' AND o.expires_at>NOW() AND r.status='DRIVER_ASSIGNED' AND o.released_at IS NULL AND o.cancelled_at IS NULL)
      OR (:view='active' AND o.status='ACCEPTED' AND r.status IN ('CONFIRMED','IN_PROGRESS') AND o.released_at IS NULL AND o.cancelled_at IS NULL)
      OR (:view='completed' AND o.status='ACCEPTED' AND o.released_at IS NULL AND r.status='COMPLETED')
      OR (:view='cancelled' AND o.cancelled_at IS NOT NULL)
      OR (:view='rejected' AND o.status='REJECTED')
      OR (:view='history')) ORDER BY o.created_at DESC,o.id DESC LIMIT :limit OFFSET :offset;

/* @name GetRideCompletion */
SELECT * FROM ride_completions WHERE ride_id=:rideId;

/* @name RecordRideCompletion */
INSERT INTO ride_completions(id,ride_id,driver_profile_id,declared_by,declared_cash,payment_id,note) VALUES(:operationId,:rideId,:profileId,:actorId,:cash,:paymentId,:note) RETURNING *;
