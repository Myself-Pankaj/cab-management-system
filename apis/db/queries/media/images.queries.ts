/** Types generated for queries found in "db/queries/media/images.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type image_owner_type = 'DRIVER_DOCUMENT' | 'USER' | 'VEHICLE' | 'VEHICLE_DOCUMENT';

/** 'CreateImage' parameters type */
export interface ICreateImageParams {
  fileName?: string | null | void;
  imagekitFileId: string;
  imageType: string;
  mimeType?: string | null | void;
  ownerId: string;
  ownerType: image_owner_type;
  url: string;
}

/** 'CreateImage' return type */
export interface ICreateImageResult {
  created_at: Date;
  file_name: string | null;
  id: string;
  image_type: string;
  imagekit_file_id: string;
  mime_type: string | null;
  owner_id: string;
  owner_type: image_owner_type;
  updated_at: Date;
  url: string;
}

/** 'CreateImage' query type */
export interface ICreateImageQuery {
  params: ICreateImageParams;
  result: ICreateImageResult;
}

const createImageIR: any = {"usedParamSet":{"ownerType":true,"ownerId":true,"imageType":true,"imagekitFileId":true,"url":true,"fileName":true,"mimeType":true},"params":[{"name":"ownerType","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":152}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":177,"b":185}]},{"name":"imageType","required":true,"transform":{"type":"scalar"},"locs":[{"a":198,"b":208}]},{"name":"imagekitFileId","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":230}]},{"name":"url","required":true,"transform":{"type":"scalar"},"locs":[{"a":237,"b":241}]},{"name":"fileName","required":false,"transform":{"type":"scalar"},"locs":[{"a":248,"b":256}]},{"name":"mimeType","required":false,"transform":{"type":"scalar"},"locs":[{"a":263,"b":271}]}],"statement":"INSERT INTO images (\n    owner_type,\n    owner_id,\n    image_type,\n    imagekit_file_id,\n    url,\n    file_name,\n    mime_type\n)\nVALUES (\n    :ownerType!::image_owner_type,\n    :ownerId!::uuid,\n    :imageType!,\n    :imagekitFileId!,\n    :url!,\n    :fileName,\n    :mimeType\n)\nRETURNING\n    id,\n    owner_type,\n    owner_id,\n    image_type,\n    imagekit_file_id,\n    url,\n    file_name,\n    mime_type,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO images (
 *     owner_type,
 *     owner_id,
 *     image_type,
 *     imagekit_file_id,
 *     url,
 *     file_name,
 *     mime_type
 * )
 * VALUES (
 *     :ownerType!::image_owner_type,
 *     :ownerId!::uuid,
 *     :imageType!,
 *     :imagekitFileId!,
 *     :url!,
 *     :fileName,
 *     :mimeType
 * )
 * RETURNING
 *     id,
 *     owner_type,
 *     owner_id,
 *     image_type,
 *     imagekit_file_id,
 *     url,
 *     file_name,
 *     mime_type,
 *     created_at,
 *     updated_at
 * ```
 */
export const createImage = new PreparedQuery<ICreateImageParams,ICreateImageResult>(createImageIR);


/** 'ListImagesByOwner' parameters type */
export interface IListImagesByOwnerParams {
  ownerId: string;
  ownerType: image_owner_type;
}

/** 'ListImagesByOwner' return type */
export interface IListImagesByOwnerResult {
  created_at: Date;
  file_name: string | null;
  id: string;
  image_type: string;
  imagekit_file_id: string;
  mime_type: string | null;
  owner_id: string;
  owner_type: image_owner_type;
  updated_at: Date;
  url: string;
}

/** 'ListImagesByOwner' query type */
export interface IListImagesByOwnerQuery {
  params: IListImagesByOwnerParams;
  result: IListImagesByOwnerResult;
}

const listImagesByOwnerIR: any = {"usedParamSet":{"ownerType":true,"ownerId":true},"params":[{"name":"ownerType","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":194}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":239}]}],"statement":"SELECT\n    id,\n    owner_type,\n    owner_id,\n    image_type,\n    imagekit_file_id,\n    url,\n    file_name,\n    mime_type,\n    created_at,\n    updated_at\nFROM images\nWHERE owner_type = :ownerType!::image_owner_type\n  AND owner_id = :ownerId!::uuid\nORDER BY created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     owner_type,
 *     owner_id,
 *     image_type,
 *     imagekit_file_id,
 *     url,
 *     file_name,
 *     mime_type,
 *     created_at,
 *     updated_at
 * FROM images
 * WHERE owner_type = :ownerType!::image_owner_type
 *   AND owner_id = :ownerId!::uuid
 * ORDER BY created_at DESC
 * ```
 */
export const listImagesByOwner = new PreparedQuery<IListImagesByOwnerParams,IListImagesByOwnerResult>(listImagesByOwnerIR);


/** 'GetImageById' parameters type */
export interface IGetImageByIdParams {
  id: string;
}

/** 'GetImageById' return type */
export interface IGetImageByIdResult {
  created_at: Date;
  file_name: string | null;
  id: string;
  image_type: string;
  imagekit_file_id: string;
  mime_type: string | null;
  owner_id: string;
  owner_type: image_owner_type;
  updated_at: Date;
  url: string;
}

/** 'GetImageById' query type */
export interface IGetImageByIdQuery {
  params: IGetImageByIdParams;
  result: IGetImageByIdResult;
}

const getImageByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":176,"b":179}]}],"statement":"SELECT\n    id,\n    owner_type,\n    owner_id,\n    image_type,\n    imagekit_file_id,\n    url,\n    file_name,\n    mime_type,\n    created_at,\n    updated_at\nFROM images\nWHERE id = :id!::uuid\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     owner_type,
 *     owner_id,
 *     image_type,
 *     imagekit_file_id,
 *     url,
 *     file_name,
 *     mime_type,
 *     created_at,
 *     updated_at
 * FROM images
 * WHERE id = :id!::uuid
 * LIMIT 1
 * ```
 */
export const getImageById = new PreparedQuery<IGetImageByIdParams,IGetImageByIdResult>(getImageByIdIR);


/** 'DeleteImageById' parameters type */
export interface IDeleteImageByIdParams {
  id: string;
}

/** 'DeleteImageById' return type */
export interface IDeleteImageByIdResult {
  created_at: Date;
  file_name: string | null;
  id: string;
  image_type: string;
  imagekit_file_id: string;
  mime_type: string | null;
  owner_id: string;
  owner_type: image_owner_type;
  updated_at: Date;
  url: string;
}

/** 'DeleteImageById' query type */
export interface IDeleteImageByIdQuery {
  params: IDeleteImageByIdParams;
  result: IDeleteImageByIdResult;
}

const deleteImageByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":30,"b":33}]}],"statement":"DELETE FROM images\nWHERE id = :id!::uuid\nRETURNING\n    id,\n    owner_type,\n    owner_id,\n    image_type,\n    imagekit_file_id,\n    url,\n    file_name,\n    mime_type,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM images
 * WHERE id = :id!::uuid
 * RETURNING
 *     id,
 *     owner_type,
 *     owner_id,
 *     image_type,
 *     imagekit_file_id,
 *     url,
 *     file_name,
 *     mime_type,
 *     created_at,
 *     updated_at
 * ```
 */
export const deleteImageById = new PreparedQuery<IDeleteImageByIdParams,IDeleteImageByIdResult>(deleteImageByIdIR);


/** 'CountImagesByOwner' parameters type */
export interface ICountImagesByOwnerParams {
  ownerId: string;
  ownerType: image_owner_type;
}

/** 'CountImagesByOwner' return type */
export interface ICountImagesByOwnerResult {
  count: number;
}

/** 'CountImagesByOwner' query type */
export interface ICountImagesByOwnerQuery {
  params: ICountImagesByOwnerParams;
  result: ICountImagesByOwnerResult;
}

const countImagesByOwnerIR: any = {"usedParamSet":{"ownerType":true,"ownerId":true},"params":[{"name":"ownerType","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":74}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":119}]}],"statement":"SELECT COUNT(*)::int AS \"count!\"\nFROM images\nWHERE owner_type = :ownerType!::image_owner_type\n  AND owner_id = :ownerId!::uuid"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS "count!"
 * FROM images
 * WHERE owner_type = :ownerType!::image_owner_type
 *   AND owner_id = :ownerId!::uuid
 * ```
 */
export const countImagesByOwner = new PreparedQuery<ICountImagesByOwnerParams,ICountImagesByOwnerResult>(countImagesByOwnerIR);


/** 'CountImagesByOwnerAndType' parameters type */
export interface ICountImagesByOwnerAndTypeParams {
  imageType: string;
  ownerId: string;
  ownerType: image_owner_type;
}

/** 'CountImagesByOwnerAndType' return type */
export interface ICountImagesByOwnerAndTypeResult {
  count: number;
}

/** 'CountImagesByOwnerAndType' query type */
export interface ICountImagesByOwnerAndTypeQuery {
  params: ICountImagesByOwnerAndTypeParams;
  result: ICountImagesByOwnerAndTypeResult;
}

const countImagesByOwnerAndTypeIR: any = {"usedParamSet":{"ownerType":true,"ownerId":true,"imageType":true},"params":[{"name":"ownerType","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":74}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":119}]},{"name":"imageType","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":156}]}],"statement":"SELECT COUNT(*)::int AS \"count!\"\nFROM images\nWHERE owner_type = :ownerType!::image_owner_type\n  AND owner_id = :ownerId!::uuid\n  AND image_type = :imageType!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT COUNT(*)::int AS "count!"
 * FROM images
 * WHERE owner_type = :ownerType!::image_owner_type
 *   AND owner_id = :ownerId!::uuid
 *   AND image_type = :imageType!
 * ```
 */
export const countImagesByOwnerAndType = new PreparedQuery<ICountImagesByOwnerAndTypeParams,ICountImagesByOwnerAndTypeResult>(countImagesByOwnerAndTypeIR);


