import type { IGetImageByIdResult } from '@db/queries/media/images.queries.js';

export interface ImageResponse {
  id: string;
  owner_type: string;
  owner_id: string;
  image_type: string;
  imagekit_file_id: string;
  url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export function toImageResponse(row: IGetImageByIdResult): ImageResponse {
  return {
    id: row.id,
    owner_type: row.owner_type,
    owner_id: row.owner_id,
    image_type: row.image_type,
    imagekit_file_id: row.imagekit_file_id,
    url: row.url,
    file_name: row.file_name,
    mime_type: row.mime_type,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
