import type { Response } from 'express';
import { UploadVehiclePhotoDto } from '@app/resources/media/dto/upload-vehicle-photo.dto.js';
import { UploadDocumentDto } from '@app/resources/media/dto/upload-document.dto.js';
import { ApiEnvelope } from '../openapi/api-envelope.decorator.js';
import {
  UploadAuthResponseDto,
  ImageDataDto,
  DocumentUploadDataDto,
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
  ParseUUIDPipe,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
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

  @Post('vehicles/:vehicleId/photos')
  @ApiOperation({ summary: 'Upload a vehicle photo (maximum 10 MB)' })
  @ApiEnvelope(ImageDataDto, 201)
  uploadVehiclePhoto(
    @CurrentUser() user: JwtClaims,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: UploadVehiclePhotoDto,
  ) {
    return this.mediaService.uploadVehiclePhoto(user.user_id, vehicleId, dto);
  }

  @Post('documents/upload')
  @ApiOperation({
    summary: 'Upload a private driver or vehicle document (maximum 10 MB)',
  })
  @ApiEnvelope(DocumentUploadDataDto, 201)
  uploadDocument(
    @CurrentUser() user: JwtClaims,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.mediaService.uploadDocument(user.user_id, dto);
  }
  @Get('documents/:id/content')
  @ApiQuery({ name: 'download', required: false, enum: ['1'] })
  @ApiResponse({
    status: 200,
    description: 'Private document bytes',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiOperation({
    summary: 'View a private document as its owner or an admin reviewer',
  })
  async viewDocument(
    @CurrentUser() user: JwtClaims,
    @Param('id') id: string,
    @Res() response: Response,
    @Query('download') download?: string,
  ) {
    const file = await this.mediaService.documentContent(user.user_id, id);
    response
      .set({
        'Content-Type': file.mime,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        // PDFs are downloaded or fetched as bytes for canvas rendering, never embedded.
        'Content-Disposition': `${download === '1' || file.mime === 'application/pdf' ? 'attachment' : 'inline'}; filename="document.${file.mime === 'application/pdf' ? 'pdf' : file.mime === 'image/jpeg' ? 'jpg' : file.mime === 'image/png' ? 'png' : 'webp'}"`,
        'Content-Security-Policy': "sandbox; default-src 'none'",
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Referrer-Policy': 'no-referrer',
      })
      .send(file.data);
  }

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
  @ApiQuery({ name: 'expected_revision', required: false, type: Number })
  deleteImage(
    @CurrentUser() user: JwtClaims,
    @Param('id') id: string,
    @Query('expected_revision', new ParseIntPipe({ optional: true }))
    expectedRevision?: number,
  ) {
    return this.mediaService.deleteImage(user.user_id, id, expectedRevision);
  }
}
