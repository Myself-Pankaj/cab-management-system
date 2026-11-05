-- +migrate Up

CREATE TYPE image_owner_type AS ENUM (
    'USER',
    'DRIVER_DOCUMENT',
    'VEHICLE',
    'VEHICLE_DOCUMENT'
);

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type image_owner_type NOT NULL,
    owner_id UUID NOT NULL,
    image_type VARCHAR(30) NOT NULL,
    imagekit_file_id VARCHAR(255) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER images_update_timestamp
BEFORE UPDATE ON images
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX idx_images_owner ON images (owner_type, owner_id);
CREATE INDEX idx_images_owner_type ON images (owner_type, owner_id, image_type);

-- +migrate Down

DROP TRIGGER IF EXISTS images_update_timestamp ON images;
DROP INDEX IF EXISTS idx_images_owner_type;
DROP INDEX IF EXISTS idx_images_owner;
DROP TABLE IF EXISTS images;
DROP TYPE IF EXISTS image_owner_type;
