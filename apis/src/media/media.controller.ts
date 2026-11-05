import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  UploadAuthResponseDto,
  ImageDataDto,
  ImagesDataDto,
  MessageResponseDto,
} from '../openapi/response.dto.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, MediaService } from '@app/resources';
import { RegisterImageDto } from '@app/resources/media/dto/register-image.dto.js';
import type { JwtClaims } from '@app/resources/auth/types/auth.types.js';
import type { image_owner_type } from '@db/queries/media/images.queries.js';

@ApiTags('Media')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('upload-auth')
  @ApiOperation({
    summary: 'Get ImageKit client upload authentication parameters',
  })
  @ApiEnvelope(UploadAuthResponseDto, 200)
  getUploadAuth() {
    return this.mediaService.getUploadAuth();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register uploaded image metadata' })
  @ApiEnvelope(ImageDataDto, 201)
  registerImage(@CurrentUser() user: JwtClaims, @Body() dto: RegisterImageDto) {
    return this.mediaService.registerImage(user.user_id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List images for an owner' })
  @ApiQuery({
    name: 'owner_type',
    enum: ['USER', 'DRIVER_DOCUMENT', 'VEHICLE', 'VEHICLE_DOCUMENT'],
  })
  @ApiQuery({ name: 'owner_id', type: String })
  @ApiEnvelope(ImagesDataDto, 200)
  listImages(
    @CurrentUser() user: JwtClaims,
    @Query('owner_type') ownerType: image_owner_type,
    @Query('owner_id') ownerId: string,
  ) {
    return this.mediaService.listImages(user.user_id, ownerType, ownerId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete image metadata and ImageKit file' })
  @ApiEnvelope(MessageResponseDto, 200)
  deleteImage(@CurrentUser() user: JwtClaims, @Param('id') id: string) {
    return this.mediaService.deleteImage(user.user_id, id);
  }
}
