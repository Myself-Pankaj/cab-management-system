/* @name AdminUserCounts */
SELECT COUNT(*)::int AS total,
 COUNT(*) FILTER (WHERE global_role='Driver')::int AS drivers,
 COUNT(*) FILTER (WHERE global_role='Passenger')::int AS passengers,
 COUNT(*) FILTER (WHERE global_role='Admin')::int AS admins,
 COUNT(*) FILTER (WHERE global_role IS NULL)::int AS unselected FROM users WHERE deleted_at IS NULL;

/* @name AdminVehicleCounts */
SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM vehicles;

/* @name AdminRideCounts */
WITH operational_rides AS (
 SELECT r.*, CASE WHEN expired.id IS NOT NULL
 THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
)
SELECT COUNT(*)::int AS total,
 COUNT(*) FILTER (WHERE pickup_at >= date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
 AND pickup_at < (date_trunc('day',NOW() AT TIME ZONE 'Asia/Kolkata')+INTERVAL '1 day') AT TIME ZONE 'Asia/Kolkata')::int AS today,
 COUNT(*) FILTER (WHERE operational_status IN ('CONFIRMED','IN_PROGRESS'))::int AS active,
 COUNT(*) FILTER (WHERE operational_status='COMPLETED')::int AS completed,
 COUNT(*) FILTER (WHERE operational_status='PENDING_ASSIGNMENT')::int AS awaiting_assignment,
 COUNT(*) FILTER (WHERE operational_status='DRIVER_ASSIGNED')::int AS awaiting_acceptance,
 COUNT(*) FILTER (WHERE operational_status='CONFIRMED')::int AS confirmed,
 COUNT(*) FILTER (WHERE operational_status='IN_PROGRESS')::int AS ongoing,
 COUNT(*) FILTER (WHERE operational_status='CANCELLED')::int AS cancelled,
 COUNT(*) FILTER (WHERE operational_status='PENDING_PAYMENT')::int AS pending_payment,
 COUNT(*) FILTER (WHERE operational_status='PAYMENT_FAILED')::int AS payment_failed FROM operational_rides;

/* @name AdminVerificationCounts */
WITH applications AS (
 SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 p.created_at, v.submitted_at,
 CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 WHEN v.status='REJECTED' THEN 'REJECTED'
 WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 FROM driver_profiles p JOIN users u ON u.id=p.user_id
 LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 WHERE u.deleted_at IS NULL
), classified AS (
 SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
)
SELECT (SELECT COUNT(*)::int FROM classified WHERE review_state='PENDING_VERIFICATION') AS pending_drivers,
 ((SELECT COUNT(*) FROM driver_documents d JOIN classified a ON a.id=d.driver_profile_id WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING')+
 (SELECT COUNT(*) FROM vehicle_documents d JOIN vehicles v ON v.id=d.vehicle_id JOIN classified a ON a.id=v.driver_profile_id
 WHERE a.review_state='PENDING_VERIFICATION' AND d.status='PENDING'))::int AS pending_documents;

/* @name AdminListUsers */
SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'
 OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')
 AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)
 AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)
 OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)
 OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked)) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!;

/* @name AdminCountUsers */
SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%'
 OR email ILIKE '%' || :search::text || '%' OR phone_number ILIKE '%' || :search::text || '%')
 AND (:role::text IS NULL OR COALESCE(global_role::text,'UNSELECTED')=:role::text)
 AND (:accountStatus::text IS NULL OR (:accountStatus::text='BLOCKED' AND is_blocked)
 OR (:accountStatus::text='ACTIVE' AND is_active AND NOT is_blocked)
 OR (:accountStatus::text='INACTIVE' AND NOT is_active AND NOT is_blocked));

/* @name AdminGetUser */
SELECT id, full_name, email, phone_number, global_role, is_active, is_blocked, created_at, last_login_at FROM users WHERE id=:id!::uuid AND deleted_at IS NULL;

/* @name AdminListApplications */
WITH applications AS (
 SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 p.created_at, v.submitted_at,
 CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 WHEN v.status='REJECTED' THEN 'REJECTED'
 WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 FROM driver_profiles p JOIN users u ON u.id=p.user_id
 LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 WHERE u.deleted_at IS NULL
), classified AS (
 SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
)
SELECT * FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%') ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!;

/* @name AdminCountApplications */
WITH applications AS (
 SELECT p.id, p.user_id, p.status AS profile_status, u.full_name, u.email,
 p.created_at, v.submitted_at,
 CASE WHEN p.status='DRAFT' THEN 'DRAFT'
 WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION'
 WHEN v.status='REJECTED' THEN 'REJECTED'
 WHEN p.status='PENDING_VERIFICATION' THEN 'PENDING_VERIFICATION'
 WHEN p.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 COALESCE(cardinality(v.correction_document_ids),0)>0 AS has_corrections
 FROM driver_profiles p JOIN users u ON u.id=p.user_id
 LEFT JOIN LATERAL (SELECT status, correction_document_ids, submitted_at FROM driver_verifications
 WHERE driver_profile_id=p.id ORDER BY submitted_at DESC, id DESC LIMIT 1) v ON true
 WHERE u.deleted_at IS NULL
), classified AS (
 SELECT *, CASE WHEN application_status='REJECTED' AND has_corrections
 THEN 'CORRECTION_REQUESTED' ELSE application_status END AS review_state FROM applications
)
SELECT COUNT(*)::int AS total FROM classified WHERE (:state::text IS NULL OR review_state=:state::text) AND (:search::text IS NULL OR full_name ILIKE '%' || :search::text || '%' OR email ILIKE '%' || :search::text || '%');

/* @name AdminListVehicles */
SELECT v.id, v.driver_profile_id, v.vehicle_number, v.vehicle_type, v.make, v.model, v.color, v.manufacturing_year, v.updated_at, v.is_active, v.created_at, u.full_name AS driver_name FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id
 WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')
 AND (:active::boolean IS NULL OR v.is_active=:active::boolean)
 AND (:category::text IS NULL OR v.vehicle_type::text=:category::text) ORDER BY v.created_at DESC, v.id DESC LIMIT :limit! OFFSET :offset!;

/* @name AdminCountVehicles */
SELECT COUNT(*)::int AS total FROM vehicles v JOIN driver_profiles d ON d.id=v.driver_profile_id JOIN users u ON u.id=d.user_id
 WHERE (:search::text IS NULL OR v.vehicle_number ILIKE '%' || :search::text || '%' OR u.full_name ILIKE '%' || :search::text || '%')
 AND (:active::boolean IS NULL OR v.is_active=:active::boolean)
 AND (:category::text IS NULL OR v.vehicle_type::text=:category::text);

/* @name AdminVehicleDocuments */
SELECT id, vehicle_id, document_type, status, expiry_date FROM vehicle_documents WHERE vehicle_id = ANY(:vehicleIds!::uuid[]) ORDER BY uploaded_at DESC, id DESC;

/* @name AdminListPayments */
SELECT p.id, p.ride_id, p.user_id, u.full_name AS user_name, p.payment_type, p.amount, p.currency, p.status, p.provider, p.payment_method, p.paid_at, p.failed_at, p.created_at FROM payments p JOIN users u ON u.id=p.user_id
 WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)
 AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)
 AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)
 AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz) ORDER BY p.created_at DESC, p.id DESC LIMIT :limit! OFFSET :offset!;

/* @name AdminPaymentCounts */
SELECT COUNT(*)::int AS total,
 COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='ONLINE'),0) AS online_collected,
 COALESCE(SUM(p.amount) FILTER (WHERE p.status='PAID' AND p.payment_type='OFFLINE'),0) AS cash_collected,
 COUNT(*) FILTER (WHERE p.status='PAID')::int AS successful,
 COUNT(*) FILTER (WHERE p.status='FAILED')::int AS failed,
 COUNT(*) FILTER (WHERE p.status='REFUNDED')::int AS refunded,
 COUNT(*) FILTER (WHERE p.status='PARTIALLY_REFUNDED')::int AS partially_refunded FROM payments p JOIN users u ON u.id=p.user_id
 WHERE (:status::payment_status IS NULL OR p.status=:status::payment_status)
 AND (:paymentType::payment_type IS NULL OR p.payment_type=:paymentType::payment_type)
 AND (:dateFrom::timestamptz IS NULL OR p.created_at>=:dateFrom::timestamptz)
 AND (:dateTo::timestamptz IS NULL OR p.created_at<:dateTo::timestamptz);

/* @name AdminListOperationalRides */
WITH operational_rides AS (
 SELECT r.*, CASE WHEN expired.id IS NOT NULL
 THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
)
SELECT * FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)
 AND (:driverProfileId::uuid IS NULL OR (
 (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(
 SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid
 AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL
 AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')
 OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))
 OR (:view::text='completed' AND operational_status='COMPLETED' AND (
 EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)
 OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)
 AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid
 AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))
 OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid)))) ORDER BY created_at DESC, id DESC LIMIT :limit! OFFSET :offset!;

/* @name AdminCountOperationalRides */
WITH operational_rides AS (
 SELECT r.*, CASE WHEN expired.id IS NOT NULL
 THEN 'PENDING_ASSIGNMENT'::ride_status ELSE r.status END AS operational_status
 FROM rides r LEFT JOIN ride_offers expired ON expired.ride_id=r.id
 AND r.status='DRIVER_ASSIGNED' AND expired.status='PENDING'
 AND expired.released_at IS NULL AND expired.cancelled_at IS NULL AND expired.expires_at<=NOW()
)
SELECT COUNT(*)::int AS total FROM operational_rides WHERE (:status::ride_status IS NULL OR operational_status=:status::ride_status) AND (:category::vehicle_category IS NULL OR requested_vehicle_category=:category::vehicle_category) AND (:userId::uuid IS NULL OR booked_by_user_id=:userId::uuid)
 AND (:driverProfileId::uuid IS NULL OR (
 (:view::text='assigned' AND driver_profile_id=:driverProfileId::uuid AND EXISTS(
 SELECT 1 FROM ride_offers assigned WHERE assigned.ride_id=operational_rides.id AND assigned.driver_profile_id=:driverProfileId::uuid
 AND assigned.vehicle_id=operational_rides.vehicle_id AND assigned.released_at IS NULL AND assigned.cancelled_at IS NULL
 AND ((assigned.status='PENDING' AND assigned.expires_at>NOW() AND operational_status='DRIVER_ASSIGNED')
 OR (assigned.status='ACCEPTED' AND operational_status IN ('CONFIRMED','IN_PROGRESS')))))
 OR (:view::text='completed' AND operational_status='COMPLETED' AND (
 EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id AND c.driver_profile_id=:driverProfileId::uuid)
 OR (NOT EXISTS(SELECT 1 FROM ride_completions c WHERE c.ride_id=operational_rides.id)
 AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid
 AND o.status='ACCEPTED' AND o.released_at IS NULL AND o.cancelled_at IS NULL))))
 OR (:view::text IS NULL AND EXISTS(SELECT 1 FROM ride_offers o WHERE o.ride_id=operational_rides.id AND o.driver_profile_id=:driverProfileId::uuid))));

/* @name AdminRecentVerifications */
SELECT p.id,p.user_id,p.status AS profile_status,u.full_name,u.email,p.created_at,v.submitted_at,
 CASE WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' WHEN v.status='REJECTED' THEN 'REJECTED' ELSE 'APPROVED' END AS application_status,
 CASE WHEN v.status='REJECTED' AND cardinality(v.correction_document_ids)>0 THEN 'CORRECTION_REQUESTED'
 WHEN v.status='PENDING' THEN 'PENDING_VERIFICATION' ELSE v.status::text END AS review_state,
 cardinality(v.correction_document_ids)>0 AS has_corrections
FROM driver_profiles p JOIN users u ON u.id=p.user_id
JOIN LATERAL (SELECT * FROM driver_verifications WHERE driver_profile_id=p.id ORDER BY submitted_at DESC,id DESC LIMIT 1) v ON true
WHERE u.deleted_at IS NULL ORDER BY v.submitted_at DESC,p.id DESC LIMIT 3;

/* @name AdminGetPayment */
SELECT p.*,u.full_name AS user_name FROM payments p JOIN users u ON u.id=p.user_id WHERE p.id=:id!::uuid;

/* @name AdminVehicleBlockers */
SELECT r.id AS ride_id,o.id AS offer_id FROM rides r LEFT JOIN ride_offers o ON o.ride_id=r.id
 AND o.vehicle_id=:vehicleId!::uuid AND o.released_at IS NULL AND o.cancelled_at IS NULL
 AND ((o.status='PENDING' AND o.expires_at>NOW()) OR o.status='ACCEPTED')
WHERE (r.vehicle_id=:vehicleId!::uuid AND r.status IN ('CONFIRMED','IN_PROGRESS'))
 OR (o.id IS NOT NULL AND r.status IN ('DRIVER_ASSIGNED','CONFIRMED','IN_PROGRESS'));

/* @name AdminUpdateVehicle */
UPDATE vehicles SET vehicle_number=:vehicleNumber!,vehicle_type=:vehicleType!,make=:make,model=:model,
 color=:color,manufacturing_year=:manufacturingYear,is_active=:active! WHERE id=:id!::uuid RETURNING *;

/* @name AdminVehicleAudit */
SELECT id,actor_id,reason,before_values,after_values,created_at FROM vehicle_edit_audit WHERE vehicle_id=:id!::uuid ORDER BY created_at DESC,id DESC;

/* @name AdminInsertVehicleAudit */
INSERT INTO vehicle_edit_audit(vehicle_id,actor_id,reason,before_values,after_values)
VALUES(:vehicleId!::uuid,:actorId!::uuid,:reason,:before!::jsonb,:after!::jsonb);
