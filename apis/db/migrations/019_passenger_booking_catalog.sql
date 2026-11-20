-- +migrate Up
ALTER TABLE vehicle_fare_rates
 ADD COLUMN description VARCHAR(500) NOT NULL DEFAULT '',
 ADD COLUMN image_url TEXT,
 ADD COLUMN bag_capacity INTEGER NOT NULL DEFAULT 2 CHECK (bag_capacity BETWEEN 0 AND 30),
 ADD CONSTRAINT nonnegative_fares CHECK (base_fare_inr >= 0 AND per_km_rate_inr >= 0 AND min_fare_inr >= 0);
UPDATE vehicle_fare_rates SET bag_capacity = CASE category WHEN 'SEATER_7' THEN 4 WHEN 'SEATER_12' THEN 8 ELSE 2 END;
ALTER TABLE rides
 ADD COLUMN bag_count INTEGER NOT NULL DEFAULT 0 CHECK (bag_count BETWEEN 0 AND 30),
 ADD COLUMN special_requests VARCHAR(1000),
 ADD COLUMN booking_key UUID,
 ADD COLUMN booking_payload_hash VARCHAR(64);
CREATE UNIQUE INDEX rides_booker_booking_key ON rides(booked_by_user_id, booking_key) WHERE booking_key IS NOT NULL;
-- +migrate Down
DROP INDEX rides_booker_booking_key;
ALTER TABLE rides DROP COLUMN bag_count, DROP COLUMN special_requests, DROP COLUMN booking_key, DROP COLUMN booking_payload_hash;
ALTER TABLE vehicle_fare_rates DROP CONSTRAINT nonnegative_fares, DROP COLUMN description, DROP COLUMN image_url, DROP COLUMN bag_capacity;
