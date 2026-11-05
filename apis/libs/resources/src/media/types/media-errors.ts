import { HttpException, HttpStatus } from '@nestjs/common';

export class MediaError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode: string,
  ) {
    super({ message, errorCode }, status);
  }
}

export const MediaErrors = {
  imageNotFound: () =>
    new MediaError('Image not found', HttpStatus.NOT_FOUND, 'IMAGE_NOT_FOUND'),
  forbidden: () =>
    new MediaError('Not allowed to access this media', HttpStatus.FORBIDDEN, 'MEDIA_FORBIDDEN'),
  invalidOwner: () =>
    new MediaError('Invalid media owner', HttpStatus.BAD_REQUEST, 'INVALID_MEDIA_OWNER'),
  imagekitNotConfigured: () =>
    new MediaError(
      'ImageKit is not configured',
      HttpStatus.SERVICE_UNAVAILABLE,
      'IMAGEKIT_NOT_CONFIGURED',
    ),
};
