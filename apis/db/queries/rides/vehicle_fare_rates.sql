/* @name ListActiveFareRates */
SELECT
    category,
    display_name,
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
