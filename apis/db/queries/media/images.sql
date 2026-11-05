/* @name CreateImage */
INSERT INTO images (
    owner_type,
    owner_id,
    image_type,
    imagekit_file_id,
    url,
    file_name,
    mime_type
)
VALUES (
    :ownerType!::image_owner_type,
    :ownerId!::uuid,
    :imageType!,
    :imagekitFileId!,
    :url!,
    :fileName,
    :mimeType
)
RETURNING
    id,
    owner_type,
    owner_id,
    image_type,
    imagekit_file_id,
    url,
    file_name,
    mime_type,
    created_at,
    updated_at;

/* @name ListImagesByOwner */
SELECT
    id,
    owner_type,
    owner_id,
    image_type,
    imagekit_file_id,
    url,
    file_name,
    mime_type,
    created_at,
    updated_at
FROM images
WHERE owner_type = :ownerType!::image_owner_type
  AND owner_id = :ownerId!::uuid
ORDER BY created_at DESC;

/* @name GetImageById */
SELECT
    id,
    owner_type,
    owner_id,
    image_type,
    imagekit_file_id,
    url,
    file_name,
    mime_type,
    created_at,
    updated_at
FROM images
WHERE id = :id!::uuid
LIMIT 1;

/* @name DeleteImageById */
DELETE FROM images
WHERE id = :id!::uuid
RETURNING
    id,
    owner_type,
    owner_id,
    image_type,
    imagekit_file_id,
    url,
    file_name,
    mime_type,
    created_at,
    updated_at;

/* @name CountImagesByOwner */
SELECT COUNT(*)::int AS "count!"
FROM images
WHERE owner_type = :ownerType!::image_owner_type
  AND owner_id = :ownerId!::uuid;

/* @name CountImagesByOwnerAndType */
SELECT COUNT(*)::int AS "count!"
FROM images
WHERE owner_type = :ownerType!::image_owner_type
  AND owner_id = :ownerId!::uuid
  AND image_type = :imageType!;
