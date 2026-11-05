import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { toUserResponse } from '../../auth/types/auth.types.js';
import { ImageRepository } from '../../media/repositories/image.repository.js';
import { toImageResponse } from '../../media/types/media.types.js';
import { DriverProfileRepository } from '../repositories/driver-profile.repository.js';
import { DriverDocumentRepository } from '../repositories/driver-document.repository.js';
import { DriverBankAccountRepository } from '../repositories/driver-bank-account.repository.js';
import { VehicleRepository } from '../repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../repositories/vehicle-document.repository.js';
import { DriverVerificationRepository } from '../repositories/driver-verification.repository.js';
import { DriverOnboardingService } from './driver-onboarding.service.js';
import { DriverErrors } from '../types/driver-errors.js';
import { toDriverProfileResponse } from '../types/driver.types.js';
import type {
  ReviewDriverDto,
  ReviewDocumentDto,
} from '../dto/review-driver.dto.js';
import type { driver_profile_status } from '@db/queries/drivers/driver_profiles.queries.js';

@Injectable()
export class AdminDriverService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: DriverProfileRepository,
    private readonly documentRepository: DriverDocumentRepository,
    private readonly bankAccountRepository: DriverBankAccountRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleDocumentRepository: VehicleDocumentRepository,
    private readonly verificationRepository: DriverVerificationRepository,
    private readonly imageRepository: ImageRepository,
    private readonly databaseService: DatabaseService,
    private readonly onboarding: DriverOnboardingService,
  ) {}

  async listPending() {
    const profiles = await this.profileRepository.listPending();
    const enriched = await Promise.all(
      profiles.map(async (profile) => {
        const user = await this.userRepository.findById(profile.user_id);
        return {
          profile: toDriverProfileResponse(profile),
          user: user ? toUserResponse(user) : null,
        };
      }),
    );
    return { drivers: enriched };
  }

  async getDriverDetails(profileId: string) {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      throw DriverErrors.profileNotFound();
    }

    const [user, documents, bankAccount, vehicles] = await Promise.all([
      this.userRepository.findById(profile.user_id),
      this.documentRepository.listByProfileId(profile.id),
      this.bankAccountRepository.findByProfileId(profile.id),
      this.vehicleRepository.listByProfileId(profile.id),
    ]);

    const documentsWithImages = await Promise.all(
      documents.map(async (doc) => ({
        id: doc.id,
        document_type: doc.document_type,
        document_number: doc.document_number,
        status: doc.status,
        rejection_reason: doc.rejection_reason,
        uploaded_at: doc.uploaded_at.toISOString(),
        reviewed_at: doc.reviewed_at?.toISOString() ?? null,
        images: (
          await this.imageRepository.listByOwner('DRIVER_DOCUMENT', doc.id)
        ).map((img) => toImageResponse(img)),
      })),
    );

    const vehiclesWithDetails = await Promise.all(
      vehicles.map(async (vehicle) => {
        const vehicleDocuments =
          await this.vehicleDocumentRepository.listByVehicleId(vehicle.id);
        return {
          ...vehicle,
          manufacturing_year: vehicle.manufacturing_year,
          created_at: vehicle.created_at.toISOString(),
          updated_at: vehicle.updated_at.toISOString(),
          images: (
            await this.imageRepository.listByOwner('VEHICLE', vehicle.id)
          ).map((img) => toImageResponse(img)),
          documents: await Promise.all(
            vehicleDocuments.map(async (doc) => ({
              id: doc.id,
              document_type: doc.document_type,
              document_number: doc.document_number,
              expiry_date: doc.expiry_date?.toISOString().slice(0, 10) ?? null,
              status: doc.status,
              rejection_reason: doc.rejection_reason,
              uploaded_at: doc.uploaded_at.toISOString(),
              reviewed_at: doc.reviewed_at?.toISOString() ?? null,
              images: (
                await this.imageRepository.listByOwner(
                  'VEHICLE_DOCUMENT',
                  doc.id,
                )
              ).map((img) => toImageResponse(img)),
            })),
          ),
        };
      }),
    );

    return {
      profile: toDriverProfileResponse(profile),
      user: user ? toUserResponse(user) : null,
      documents: documentsWithImages,
      bank_account: bankAccount
        ? {
            id: bankAccount.id,
            account_holder_name: bankAccount.account_holder_name,
            account_number: bankAccount.account_number,
            ifsc: bankAccount.ifsc,
            bank_name: bankAccount.bank_name,
            razorpay_fund_account_id: bankAccount.razorpay_fund_account_id,
            is_verified: bankAccount.is_verified,
          }
        : null,
      vehicles: vehiclesWithDetails,
    };
  }

  async reviewProfile(
    profileId: string,
    adminUserId: string,
    dto: ReviewDriverDto,
  ) {
    if (dto.decision === 'REJECTED' && !dto.rejection_reason?.trim()) {
      throw new BadRequestException('A rejection reason is required');
    }
    return this.databaseService.withTransaction(async (client) => {
      const profile = await this.profileRepository.lockById(profileId, client);
      if (!profile || profile.status !== 'PENDING_VERIFICATION') {
        throw DriverErrors.invalidStatusTransition();
      }

      const verification =
        await this.verificationRepository.findLatestByProfileId(
          profileId,
          client,
        );
      if (!verification || verification.status !== 'PENDING') {
        throw DriverErrors.verificationNotFound();
      }

      const nextStatus: driver_profile_status =
        dto.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

      if (dto.decision === 'APPROVED')
        await this.onboarding.assertComplete(profileId, client);
      const updatedProfile = await this.profileRepository.updateStatus(
        profileId,
        nextStatus,
        client,
      );
      const updatedVerification =
        await this.verificationRepository.updateReview(
          verification.id,
          dto.decision,
          adminUserId,
          dto.decision === 'REJECTED' ? dto.rejection_reason!.trim() : null,
          client,
        );
      return {
        profile: updatedProfile
          ? toDriverProfileResponse(updatedProfile)
          : null,
        verification: updatedVerification
          ? {
              id: updatedVerification.id,
              status: updatedVerification.status,
              rejection_reason: updatedVerification.rejection_reason,
              reviewed_at:
                updatedVerification.reviewed_at?.toISOString() ?? null,
            }
          : null,
      };
    });
  }

  async reviewDocument(documentId: string, dto: ReviewDocumentDto) {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw DriverErrors.documentNotFound();
    }

    return this.databaseService.withTransaction(async (client) => {
      const profile = await this.profileRepository.lockById(
        document.driver_profile_id,
        client,
      );
      if (profile?.status !== 'PENDING_VERIFICATION')
        throw DriverErrors.invalidStatusTransition();
      const updated = await this.documentRepository.updateReview(
        documentId,
        dto.decision,
        dto.rejection_reason ?? null,
        client,
      );

      return {
        document: updated
          ? {
              id: updated.id,
              status: updated.status,
              rejection_reason: updated.rejection_reason,
              reviewed_at: updated.reviewed_at?.toISOString() ?? null,
            }
          : null,
      };
    });
  }
}
