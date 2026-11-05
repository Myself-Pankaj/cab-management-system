-- +migrate Up

ALTER TABLE users
    ALTER COLUMN global_role DROP DEFAULT;

ALTER TABLE users
    ALTER COLUMN global_role DROP NOT NULL;

-- +migrate Down

UPDATE users SET global_role = 'Passenger' WHERE global_role IS NULL;

ALTER TABLE users
    ALTER COLUMN global_role SET DEFAULT 'Passenger';

ALTER TABLE users
    ALTER COLUMN global_role SET NOT NULL;
