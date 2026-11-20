/* @name CreateVehicle */
INSERT INTO vehicles (
    driver_profile_id,
    vehicle_number,
    vehicle_type,
    make,
    model,
    color,
    manufacturing_year
)
VALUES (
    :driverProfileId!::uuid,
    :vehicleNumber!,
    :vehicleType,
    :make,
    :model,
    :color,
    :manufacturingYear
)
RETURNING
    id,
    driver_profile_id,
    vehicle_number,
    vehicle_type,
    make,
    model,
    color,
    manufacturing_year,
    details_review_status,
    photos_review_status,
    details_rejection_reason,
    photos_rejection_reason,
    photos_correction_completed,
    photos_correction_baseline,
    review_revision,
    is_active,
    created_at,
    updated_at;

/* @name ListVehiclesByProfileId */
SELECT
    id,
    driver_profile_id,
    vehicle_number,
    vehicle_type,
    make,
    model,
    color,
    manufacturing_year,
    details_review_status,
    photos_review_status,
    details_rejection_reason,
    photos_rejection_reason,
    photos_correction_completed,
    photos_correction_baseline,
    review_revision,
    is_active,
    created_at,
    updated_at
FROM vehicles
WHERE driver_profile_id = :driverProfileId!::uuid
ORDER BY created_at DESC;

/* @name GetVehicleById */
SELECT
    id,
    driver_profile_id,
    vehicle_number,
    vehicle_type,
    make,
    model,
    color,
    manufacturing_year,
    details_review_status,
    photos_review_status,
    details_rejection_reason,
    photos_rejection_reason,
    photos_correction_completed,
    photos_correction_baseline,
    review_revision,
    is_active,
    created_at,
    updated_at
FROM vehicles
WHERE id = :id!::uuid
LIMIT 1;

/* @name CountActiveVehiclesByProfileId */
SELECT COUNT(*)::int AS "count!"
FROM vehicles
WHERE driver_profile_id = :driverProfileId!::uuid
  AND is_active = TRUE;

/* @name ReviewVehicleGroup */
UPDATE vehicles SET
 details_review_status=CASE WHEN :reviewGroup!::text='DETAILS' THEN :status!::review_status ELSE details_review_status END,
 photos_review_status=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :status!::review_status ELSE photos_review_status END,
 details_rejection_reason=CASE WHEN :reviewGroup!::text='DETAILS' THEN :reason::text ELSE details_rejection_reason END,
 photos_rejection_reason=CASE WHEN :reviewGroup!::text='PHOTOS' THEN :reason::text ELSE photos_rejection_reason END,
 review_revision=review_revision+CASE WHEN :increment!::boolean THEN 1 ELSE 0 END,
 photos_correction_completed=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN FALSE ELSE photos_correction_completed END,
 photos_correction_baseline=CASE WHEN :reviewGroup!::text='PHOTOS' AND :increment!::boolean THEN ARRAY(SELECT id FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid) ELSE photos_correction_baseline END
WHERE id=:id!::uuid;

/* @name MarkVehiclePhotosCorrected */
UPDATE vehicles SET photos_correction_completed=EXISTS(
 SELECT 1 FROM images WHERE owner_type='VEHICLE' AND owner_id=:id!::uuid
 AND NOT(id=ANY(vehicles.photos_correction_baseline)))
WHERE id=:id!::uuid AND photos_review_status='REJECTED';
