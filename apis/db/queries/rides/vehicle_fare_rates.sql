/* @name ListActiveFareRates */
SELECT
    category,
    display_name,
    description,
    image_url,
    bag_capacity,
    base_fare_inr,
    per_km_rate_inr,
    min_fare_inr,
    is_active,
    created_at,
    updated_at
FROM vehicle_fare_rates
WHERE is_active = TRUE
ORDER BY category;

/* @name GetFareRateByCategory */
SELECT
    category,
    display_name,
    description,
    image_url,
    bag_capacity,
    base_fare_inr,
    per_km_rate_inr,
    min_fare_inr,
    is_active,
    created_at,
    updated_at
FROM vehicle_fare_rates
WHERE category = :category!::vehicle_category
  AND is_active = TRUE
LIMIT 1;

/* @name ListAllFareRates */
SELECT * FROM vehicle_fare_rates ORDER BY category;

/* @name UpdateFareCategory */
UPDATE vehicle_fare_rates SET display_name=:displayName!, description=:description!,
 image_url=:imageUrl, bag_capacity=:bagCapacity!, base_fare_inr=:baseFare!,
 per_km_rate_inr=:perKm!, min_fare_inr=:minFare!, is_active=:isActive!
WHERE category=:category!::vehicle_category RETURNING *;
