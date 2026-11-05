import type { PoolClient } from 'pg';
import { DatabaseService } from '@app/core';
import { DriverErrors } from '../../drivers/types/driver-errors.js';
import { EDITABLE_DRIVER_PROFILE_STATUSES } from '../../drivers/types/driver.types.js';
import { Injectable } from '@nestjs/common';
import { ImageRepository } from '../repositories/image.repository.js';
import { ImageKitService } from './imagekit.service.js';
import { MediaErrors } from '../types/media-errors.js';
import { toImageResponse } from '../types/media.types.js';
import type { RegisterImageDto } from '../dto/register-image.dto.js';
import { DriverProfileRepository } from '../../drivers/repositories/driver-profile.repository.js';
import { DriverDocumentRepository } from '../../drivers/repositories/driver-document.repository.js';
import { VehicleRepository } from '../../drivers/repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../../drivers/repositories/vehicle-document.repository.js';
import type { image_owner_type } from '@db/queries/media/images.queries.js';

@Injectable()
export class MediaService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imageKitService: ImageKitService,
    private readonly profileRepository: DriverProfileRepository,
    private readonly documentRepository: DriverDocumentRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleDocumentRepository: VehicleDocumentRepository,
    private readonly databaseService: DatabaseService,
  ) {}

  getUploadAuth() {
    return this.imageKitService.getUploadAuth();
  }

  async registerImage(userId: string, dto: RegisterImageDto) {
    return this.withEditableOwner(
      userId,
      dto.owner_type,
      dto.owner_id,
      async (client) => {
        const existing = await this.imageRepository.findByFileId(
          dto.imagekit_file_id,
          client,
        );
        if (existing) {
          if (
            existing.owner_type !== dto.owner_type ||
            existing.owner_id !== dto.owner_id
          )
            throw MediaErrors.forbidden();
          return { image: toImageResponse(existing) };
        }
        const image = await this.imageRepository.create(
          {
            ownerType: dto.owner_type,
            ownerId: dto.owner_id,
            imageType: dto.image_type,
            imagekitFileId: dto.imagekit_file_id,
            url: dto.url,
            fileName: dto.file_name ?? null,
            mimeType: dto.mime_type ?? null,
          },
          client,
        );

        return { image: toImageResponse(image) };
      },
    );
  }

  async listImages(
    userId: string,
    ownerType: image_owner_type,
    ownerId: string,
  ) {
    await this.assertOwnerAccess(userId, ownerType, ownerId);
    const images = await this.imageRepository.listByOwner(ownerType, ownerId);
    return { images: images.map((row) => toImageResponse(row)) };
  }

  async deleteImage(userId: string, imageId: string) {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw MediaErrors.imageNotFound();
    }

    await this.withEditableOwner(
      userId,
      image.owner_type,
      image.owner_id,
      async (client) => {
        await this.imageRepository.deleteById(imageId, client);
      },
    );

    try {
      await this.imageKitService.deleteFile(image.imagekit_file_id);
    } catch {
      // Metadata cleanup still proceeds if ImageKit delete fails
    }

    return { message: 'Image deleted successfully' };
  }

  async listByOwner(ownerType: image_owner_type, ownerId: string) {
    const images = await this.imageRepository.listByOwner(ownerType, ownerId);
    return images.map((row) => toImageResponse(row));
  }

  async hasImageForOwner(ownerType: image_owner_type, ownerId: string) {
    const count = await this.imageRepository.countByOwner(ownerType, ownerId);
    return count > 0;
  }

  private async withEditableOwner<T>(
    userId: string,
    ownerType: image_owner_type,
    ownerId: string,
    work: (client: PoolClient) => Promise<T>,
  ) {
    return this.databaseService.withTransaction(async (client) => {
      if (ownerType !== 'USER') {
        const profile = await this.profileRepository.findByUserId(
          userId,
          client,
        );
        if (!profile) throw MediaErrors.forbidden();
        const locked = await this.profileRepository.lockById(
          profile.id,
          client,
        );
        if (
          !locked ||
          !EDITABLE_DRIVER_PROFILE_STATUSES.includes(locked.status)
        )
          throw DriverErrors.profileNotEditable();
      }
      await this.assertOwnerAccess(userId, ownerType, ownerId, client);
      return work(client);
    });
  }

  private async assertOwnerAccess(
    userId: string,
    ownerType: image_owner_type | RegisterImageDto['owner_type'],
    ownerId: string,
    client?: PoolClient,
  ) {
    switch (ownerType) {
      case 'USER':
        if (ownerId !== userId) {
          throw MediaErrors.forbidden();
        }
        return;

      case 'DRIVER_DOCUMENT': {
        const document = await this.documentRepository.findById(
          ownerId,
          client,
        );
        if (!document) {
          throw MediaErrors.invalidOwner();
        }
        const profile = await this.profileRepository.findByUserId(
          userId,
          client,
        );
        if (!profile || profile.id !== document.driver_profile_id) {
          throw MediaErrors.forbidden();
        }
        return;
      }

      case 'VEHICLE': {
        const vehicle = await this.vehicleRepository.findById(ownerId, client);
        if (!vehicle) {
          throw MediaErrors.invalidOwner();
        }
        const profile = await this.profileRepository.findByUserId(
          userId,
          client,
        );
        if (!profile || profile.id !== vehicle.driver_profile_id) {
          throw MediaErrors.forbidden();
        }
        return;
      }

      case 'VEHICLE_DOCUMENT': {
        const vehicleDocument = await this.vehicleDocumentRepository.findById(
          ownerId,
          client,
        );
        if (!vehicleDocument) {
          throw MediaErrors.invalidOwner();
        }
        const vehicle = await this.vehicleRepository.findById(
          vehicleDocument.vehicle_id,
          client,
        );
        if (!vehicle) {
          throw MediaErrors.invalidOwner();
        }
        const profile = await this.profileRepository.findByUserId(
          userId,
          client,
        );
        if (!profile || profile.id !== vehicle.driver_profile_id) {
          throw MediaErrors.forbidden();
        }
        return;
      }

      default:
        throw MediaErrors.invalidOwner();
    }
  }
}
