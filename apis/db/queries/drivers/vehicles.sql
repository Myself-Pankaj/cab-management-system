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
