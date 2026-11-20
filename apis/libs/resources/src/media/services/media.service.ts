import {
  applicationStatus,
  assertVehicleCorrection,
  assertSelectedForCorrection,
  assertDocumentEditable,
  correctedState,
} from '../../drivers/types/onboarding-policy.js';
import { DriverVerificationRepository } from '../../drivers/repositories/driver-verification.repository.js';
import { MediaCleanupService } from './media-cleanup.service.js';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import type { UploadDocumentDto } from '../dto/upload-document.dto.js';
import type { UploadVehiclePhotoDto } from '../dto/upload-vehicle-photo.dto.js';
import {
  documentFileType,
  documentImageType,
} from '../types/document-image.js';
import type { PoolClient } from 'pg';
import { DatabaseService, AppLogger } from '@app/core';
import { DriverErrors } from '../../drivers/types/driver-errors.js';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    private readonly logger: AppLogger,
    private readonly users: UserRepository,
    private readonly verifications: DriverVerificationRepository,
    private readonly cleanup: MediaCleanupService,
  ) {}

  getUploadAuth() {
    return this.imageKitService.getUploadAuth();
  }

  async uploadVehiclePhoto(
    userId: string,
    vehicleId: string,
    dto: UploadVehiclePhotoDto,
  ) {
    const data = Buffer.from(dto.content_base64, 'base64');
    const kind = documentImageType(data);
    await this.withEditableOwner(
      userId,
      'VEHICLE',
      vehicleId,
      async () => {},
      dto.expected_revision,
    );
    const uploaded = await this.imageKitService.uploadVehiclePhoto(
      data,
      vehicleId,
      kind.extension,
    );
    try {
      return await this.withEditableOwner(
        userId,
        'VEHICLE',
        vehicleId,
        async (client) => {
          const image = await this.imageRepository.create(
            {
              ownerType: 'VEHICLE',
              ownerId: vehicleId,
              imageType: 'PHOTO',
              imagekitFileId: uploaded.fileId,
              url: uploaded.url,
              fileName: `vehicle.${kind.extension}`,
              mimeType: kind.mime,
            },
            client,
          );
          await this.vehicleRepository.photoCorrected(vehicleId, client);
          return { image: toImageResponse(image) };
        },
        dto.expected_revision,
      );
    } catch (error) {
      await this.cleanup.discard(uploaded.fileId);
      throw error;
    }
  }

  async uploadDocument(userId: string, dto: UploadDocumentDto) {
    const data = Buffer.from(dto.content_base64, 'base64');
    const kind = documentFileType(data);
    await this.withEditableOwner(
      userId,
      dto.owner_type,
      dto.owner_id,
      async () => {},
      dto.expected_revision,
    );
    if (dto.owner_type === 'DRIVER_DOCUMENT') {
      const doc = await this.documentRepository.findById(dto.owner_id);
      if (doc?.document_type === 'AADHAAR' && dto.aadhaar_copy !== 'MASKED')
        throw new BadRequestException('Confirm this is a masked Aadhaar copy');
    }
    const uploaded = await this.imageKitService.uploadPrivate(
      data,
      dto.owner_id,
      kind.extension,
    );
    try {
      return await this.withEditableOwner(
        userId,
        dto.owner_type,
        dto.owner_id,
        async (client) => {
          const document = await this.documentForOwner(
            dto.owner_type,
            dto.owner_id,
            client,
          );
          if (!document) throw MediaErrors.invalidOwner();
          const previous = await this.imageRepository.listByOwner(
            dto.owner_type,
            dto.owner_id,
            client,
          );
          const image = await this.imageRepository.create(
            {
              ownerType: dto.owner_type,
              ownerId: dto.owner_id,
              imageType: 'DOCUMENT',
              imagekitFileId: uploaded.fileId,
              url: uploaded.filePath,
              fileName: `document.${kind.extension}`,
              mimeType: kind.mime,
            },
            client,
          );
          await this.imageRepository.markPrivate(image.id, client);
          const state = correctedState(
            document,
            document.document_number,
            document.expiry_date,
            true,
          );
          const params = {
            id: dto.owner_id,
            expectedRevision: dto.expected_revision,
            documentNumber: document.document_number,
            expiryDate: document.expiry_date,
            status: state.status,
            rejectionReason: state.rejectionReason,
            correction: state.correction
              ? JSON.stringify(state.correction)
              : null,
          };
          const saved =
            dto.owner_type === 'DRIVER_DOCUMENT'
              ? await this.documentRepository.saveState(params, client)
              : await this.vehicleDocumentRepository.saveState(params, client);
          for (const old of previous) {
            await this.imageRepository.deleteById(old.id, client);
            await this.cleanup.enqueue(old.imagekit_file_id, client);
          }
          return {
            image: toImageResponse(image),
            document_revision: saved.revision,
          };
        },
        dto.expected_revision,
      );
    } catch (error) {
      await this.cleanup.discard(uploaded.fileId);
      throw error;
    }
  }
  async documentContent(userId: string, imageId: string) {
    const image = await this.imageRepository.findById(imageId);
    if (
      !image ||
      !['DRIVER_DOCUMENT', 'VEHICLE_DOCUMENT'].includes(image.owner_type) ||
      !(await this.imageRepository.isPrivate(imageId))
    )
      throw MediaErrors.imageNotFound();
    const user = await this.users.findById(userId);
    if (user?.global_role !== 'Admin')
      await this.assertOwnerAccess(userId, image.owner_type, image.owner_id);
    const data = await this.imageKitService.privateContent(
      image.imagekit_file_id,
    );
    const kind = documentFileType(data);
    return { data, mime: kind.mime };
  }
  async registerImage(userId: string, dto: RegisterImageDto) {
    if (['DRIVER_DOCUMENT', 'VEHICLE_DOCUMENT'].includes(dto.owner_type))
      throw new BadRequestException('Use the private document upload endpoint');
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

  async deleteImage(
    userId: string,
    imageId: string,
    expectedRevision?: number,
  ) {
    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw MediaErrors.imageNotFound();
    }

    if (['DRIVER_DOCUMENT', 'VEHICLE_DOCUMENT'].includes(image.owner_type))
      throw new BadRequestException(
        'Replace document images through the document upload endpoint',
      );
    await this.withEditableOwner(
      userId,
      image.owner_type,
      image.owner_id,
      async (client) => {
        await this.imageRepository.deleteById(imageId, client);
        await this.cleanup.enqueue(image.imagekit_file_id, client);
        if (image.owner_type === 'VEHICLE')
          await this.vehicleRepository.photoCorrected(image.owner_id, client);
      },
      expectedRevision,
    );

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
    expectedRevision?: number,
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
        if (!locked || locked.status === 'SUSPENDED')
          throw DriverErrors.profileNotEditable();
        await this.assertOwnerAccess(userId, ownerType, ownerId, client);
        const verification = await this.verifications.findLatestByProfileId(
          locked.id,
          client,
        );
        const status = applicationStatus(locked, verification);
        if (
          (await this.vehicleRepository.listByProfileId(locked.id, client))
            .length > 1
        )
          throw DriverErrors.profileNotEditable();
        if (
          ownerType === 'DRIVER_DOCUMENT' ||
          ownerType === 'VEHICLE_DOCUMENT'
        ) {
          const document = await this.documentForOwner(
            ownerType,
            ownerId,
            client,
          );
          if (!document) throw MediaErrors.invalidOwner();
          assertSelectedForCorrection(status, ownerId, verification);
          assertDocumentEditable(status, document, expectedRevision, true);
        } else if (ownerType === 'VEHICLE' && status !== 'DRAFT') {
          if (status !== 'REJECTED') throw DriverErrors.profileNotEditable();
          const vehicle = await this.vehicleRepository.findById(
            ownerId,
            client,
          );
          if (!vehicle) throw MediaErrors.invalidOwner();
          if (vehicle.photos_review_status !== 'REJECTED')
            throw DriverErrors.profileNotEditable();
          assertVehicleCorrection(status, vehicle, 'PHOTOS', expectedRevision);
        } else if (status !== 'DRAFT') throw DriverErrors.profileNotEditable();
      } else {
        await this.assertOwnerAccess(userId, ownerType, ownerId, client);
      }
      return work(client);
    });
  }

  private documentForOwner(
    ownerType: 'DRIVER_DOCUMENT' | 'VEHICLE_DOCUMENT',
    ownerId: string,
    client: PoolClient,
  ) {
    return ownerType === 'DRIVER_DOCUMENT'
      ? this.documentRepository.findById(ownerId, client)
      : this.vehicleDocumentRepository.findById(ownerId, client);
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
