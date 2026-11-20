import type { PoolClient } from 'pg';
import { adminMutation } from '../../admin/admin-mutation.js';
import type { AdminDocumentEditDto } from '../../admin/admin-edit.dto.js';
import {
  applicationStatus,
  dateOnly,
  assertRevision,
  makeCorrection,
  parseCorrection,
} from '../types/onboarding-policy.js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { toUserResponse } from '../../auth/types/auth.types.js';
import { ImageRepository } from '../../media/repositories/image.repository.js';
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
  ReviewVehicleDto,
  ReviewDocumentDto,
} from '../dto/review-driver.dto.js';

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

  private async openCorrections(
    profileId: string,
    adminId: string,
    reason: string,
    client: PoolClient,
  ) {
    const latest = await this.verificationRepository.findLatestByProfileId(
      profileId,
      client,
    );
    const app = await this.onboarding.getApplication(profileId, client);
    const ids = [
      ...new Set([
        ...(latest?.status === 'REJECTED'
          ? latest.correction_document_ids
          : []),
        ...[...app.documents, ...app.vehicles.flatMap((v) => v.documents)]
          .filter((d) => d.status === 'REJECTED' && d.correction)
          .map((d) => d.id),
      ]),
    ];
    const verification =
      latest?.status === 'REJECTED' || latest?.status === 'PENDING'
        ? latest
        : await this.verificationRepository.create(profileId, client);
    await this.verificationRepository.updateReview(
      verification.id,
      'REJECTED',
      adminId,
      reason,
      client,
      ids,
    );
    await this.profileRepository.audit(
      profileId,
      'PROFILE',
      null,
      'REJECTED',
      adminId,
      reason,
      client,
    );
  }

  async reviewVehicle(
    vehicleId: string,
    dto: ReviewVehicleDto,
    adminId: string,
  ) {
    const owner = await this.vehicleRepository.findById(vehicleId);
    if (!owner) throw DriverErrors.vehicleNotFound();
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminId,
        dto.operation_id,
        `reviewVehicle:${vehicleId}`,
        dto,
        async () => {
          const profile = await this.profileRepository.lockById(
            owner.driver_profile_id,
            client,
          );
          if (!profile || profile.status === 'SUSPENDED')
            throw DriverErrors.invalidStatusTransition();
          const latest =
            await this.verificationRepository.findLatestByProfileId(
              profile.id,
              client,
            );
          const status = applicationStatus(profile, latest);
          if (
            status === 'DRAFT' ||
            (dto.decision === 'APPROVED' && status !== 'PENDING_VERIFICATION')
          )
            throw DriverErrors.invalidStatusTransition();
          const vehicle = await this.vehicleRepository.findById(
            vehicleId,
            client,
          );
          if (!vehicle) throw DriverErrors.vehicleNotFound();
          assertRevision(
            { revision: vehicle.review_revision },
            dto.expected_revision,
          );
          const reason =
            dto.reason?.trim() || dto.rejection_reason?.trim() || null;
          if (dto.decision === 'REJECTED' && !reason)
            throw new BadRequestException('A correction reason is required');
          if (dto.decision === 'APPROVED') {
            const app = await this.onboarding.getApplication(
              profile.id,
              client,
            );
            const saved = app.vehicles.find((v) => v.id === vehicleId);
            if (
              !saved ||
              (dto.group === 'PHOTOS'
                ? !saved.images.length
                : !saved.vehicle_number.trim() || !saved.vehicle_type)
            )
              throw new BadRequestException(
                'Save the required vehicle information before approval',
              );
          }
          await this.vehicleRepository.reviewGroup(
            vehicleId,
            dto.group,
            dto.decision,
            dto.decision === 'REJECTED' ? reason : null,
            client,
            true,
          );
          await this.profileRepository.audit(
            profile.id,
            'PROFILE',
            null,
            dto.decision,
            adminId,
            reason,
            client,
            { vehicle_id: vehicleId, group: dto.group },
          );
          if (dto.decision === 'REJECTED')
            await this.openCorrections(
              profile.id,
              adminId,
              reason ?? '',
              client,
            );
          return { profile: toDriverProfileResponse(profile) };
        },
      ),
    );
  }

  async listDrivers() {
    const profiles = await this.profileRepository.listAll();
    return {
      drivers: await Promise.all(
        profiles.map(async (profile) => ({
          profile: toDriverProfileResponse(profile),
          application_status: applicationStatus(
            profile,
            await this.verificationRepository.findLatestByProfileId(profile.id),
          ),
          user: await this.userRepository
            .findById(profile.user_id)
            .then((user) => (user ? toUserResponse(user) : null)),
        })),
      ),
    };
  }
  async suspend(
    profileId: string,
    adminId: string,
    reason: string,
    operationId: string,
  ) {
    if (!reason.trim())
      throw new BadRequestException('A suspension reason is required');
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminId,
        operationId,
        `suspend:${profileId}`,
        { reason },
        async () => {
          const profile = await this.profileRepository.lockById(
            profileId,
            client,
          );
          if (!profile || !['APPROVED', 'SUSPENDED'].includes(profile.status))
            throw DriverErrors.invalidStatusTransition();
          if (profile.status === 'APPROVED') {
            await this.profileRepository.updateStatus(
              profileId,
              'SUSPENDED',
              client,
            );
            await this.profileRepository.audit(
              profileId,
              'PROFILE',
              null,
              'SUSPENDED',
              adminId,
              reason,
              client,
            );
          }
          return {
            profile: toDriverProfileResponse({
              ...profile,
              status: 'SUSPENDED',
            }),
          };
        },
      ),
    );
  }
  async requestCorrections(
    profileId: string,
    adminId: string,
    reason: string,
    operationId: string,
  ) {
    if (!reason.trim())
      throw new BadRequestException('A correction reason is required');
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminId,
        operationId,
        `requestCorrections:${profileId}`,
        { reason },
        async () => {
          const profile = await this.profileRepository.lockById(
            profileId,
            client,
          );
          if (
            !profile ||
            !['APPROVED', 'REJECTED', 'PENDING_VERIFICATION'].includes(
              profile.status,
            )
          )
            throw DriverErrors.invalidStatusTransition();
          const latest =
            await this.verificationRepository.findLatestByProfileId(
              profileId,
              client,
            );
          if (applicationStatus(profile, latest) === 'PENDING_VERIFICATION')
            throw DriverErrors.invalidStatusTransition();
          const app = await this.onboarding.getApplication(profileId, client);
          if (
            ![
              ...app.documents,
              ...app.vehicles.flatMap((v) => v.documents),
            ].some((d) => d.status === 'REJECTED' && d.correction) &&
            !app.vehicles.some(
              (v) =>
                v.details_review_status === 'REJECTED' ||
                v.photos_review_status === 'REJECTED',
            )
          )
            throw new BadRequestException(
              'Select documents and correction requirements before returning the application',
            );
          const verification =
            latest?.status === 'REJECTED'
              ? latest
              : await this.verificationRepository.create(profileId, client);
          await this.verificationRepository.updateReview(
            verification.id,
            'REJECTED',
            adminId,
            reason.trim(),
            client,
            [...app.documents, ...app.vehicles.flatMap((v) => v.documents)]
              .filter((d) => d.status === 'REJECTED' && d.correction)
              .map((d) => d.id),
          );
          const updated = profile;
          await this.profileRepository.audit(
            profileId,
            'PROFILE',
            null,
            'REJECTED',
            adminId,
            reason.trim(),
            client,
          );
          return { profile: updated ? toDriverProfileResponse(updated) : null };
        },
      ),
    );
  }
  async listPending() {
    const { drivers } = await this.listDrivers();
    return {
      drivers: drivers.filter(
        (driver) => driver.application_status === 'PENDING_VERIFICATION',
      ),
    };
  }

  async getDriverDetails(profileId: string) {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      throw DriverErrors.profileNotFound();
    }

    const [user, application, verification] = await Promise.all([
      this.userRepository.findById(profile.user_id),
      this.onboarding.getApplication(profile.id),
      this.verificationRepository.findLatestByProfileId(profile.id),
    ]);
    return {
      ...application,
      ride_eligible:
        profile.status === 'APPROVED' &&
        application.compliance_approved &&
        applicationStatus(profile, verification, application) === 'APPROVED',
      application_status: applicationStatus(profile, verification, application),
      profile: toDriverProfileResponse(profile),
      user: user ? toUserResponse(user) : null,
      audit: await this.profileRepository.auditHistory(profile.id),
    };
  }

  async correctMetadata(
    documentId: string,
    vehicleDocument: boolean,
    actor: string,
    dto: AdminDocumentEditDto,
  ) {
    const repo = vehicleDocument
      ? this.vehicleDocumentRepository
      : this.documentRepository;
    const initial = await repo.findById(documentId);
    if (!initial) throw DriverErrors.documentNotFound();
    const vehicle =
      'vehicle_id' in initial
        ? await this.vehicleRepository.findById(initial.vehicle_id)
        : null;
    const profileId =
      'driver_profile_id' in initial
        ? initial.driver_profile_id
        : vehicle?.driver_profile_id;
    if (!profileId) throw DriverErrors.profileNotFound();
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        actor,
        dto.operation_id,
        `metadata:${documentId}`,
        dto,
        async () => {
          const profile = await this.profileRepository.lockById(
            profileId,
            client,
          );
          if (!profile || profile.status === 'SUSPENDED')
            throw DriverErrors.invalidStatusTransition();
          const document = await repo.findById(documentId, client);
          if (!document) throw DriverErrors.documentNotFound();
          assertRevision(document, dto.expected_revision);
          if (!dto.reason.trim())
            throw new BadRequestException('A correction reason is required');
          const number =
            dto.document_number === undefined
              ? document.document_number
              : dto.document_number?.trim() || null;
          const expiry =
            dto.expiry_date === undefined
              ? dateOnly(document.expiry_date)
              : dto.expiry_date;
          if (
            document.document_type === 'AADHAAR' &&
            number &&
            !/^\d{4}$/.test(number)
          )
            throw new BadRequestException(
              'Store only the last four Aadhaar digits',
            );
          if (
            !vehicleDocument &&
            document.document_type !== 'DRIVING_LICENCE' &&
            expiry
          )
            throw new BadRequestException('This document has no expiry date');
          const previous = {
            document_number: document.document_number,
            expiry_date: dateOnly(document.expiry_date),
          };
          const after = { document_number: number, expiry_date: expiry };
          if (JSON.stringify(previous) === JSON.stringify(after))
            return {
              document: {
                ...document,
                correction: parseCorrection(document.correction),
              },
            };
          const saved = await repo.saveState(
            {
              id: documentId,
              expectedRevision: dto.expected_revision,
              documentNumber: number,
              expiryDate: expiry,
              status: 'PENDING',
              rejectionReason: null,
              correction: null,
            },
            client,
          );
          await this.profileRepository.audit(
            profileId,
            vehicleDocument ? 'VEHICLE_DOCUMENT' : 'DRIVER_DOCUMENT',
            documentId,
            'METADATA_CORRECTED',
            actor,
            dto.reason.trim(),
            client,
            {
              before: previous,
              after,
              previous_revision: document.revision,
              revision: saved.revision,
            },
          );
          const latest =
            await this.verificationRepository.findLatestByProfileId(
              profileId,
              client,
            );
          if (latest?.status !== 'PENDING')
            await this.verificationRepository.create(profileId, client);
          return { document: { ...saved, correction: null } };
        },
      ),
    );
  }

  async reviewProfile(
    profileId: string,
    adminUserId: string,
    dto: ReviewDriverDto,
  ) {
    if (!(dto.reason?.trim() || dto.rejection_reason?.trim())) {
      throw new BadRequestException('A rejection reason is required');
    }
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminUserId,
        dto.operation_id,
        `reviewProfile:${profileId}`,
        dto,
        async () => {
          const profile = await this.profileRepository.lockById(
            profileId,
            client,
          );
          if (
            !profile ||
            !['PENDING_VERIFICATION', 'APPROVED'].includes(profile.status)
          ) {
            throw DriverErrors.invalidStatusTransition();
          }

          const verification =
            await this.verificationRepository.findLatestByProfileId(
              profileId,
              client,
            );
          if (
            verification?.status === 'REJECTED' &&
            dto.decision === 'REJECTED'
          ) {
            await this.openCorrections(
              profileId,
              adminUserId,
              dto.reason?.trim() || dto.rejection_reason?.trim() || '',
              client,
            );
            return {
              profile: toDriverProfileResponse(profile),
              verification: {
                id: verification.id,
                status: verification.status,
                rejection_reason:
                  dto.reason?.trim() || dto.rejection_reason?.trim() || null,
                reviewed_at: verification.reviewed_at?.toISOString() ?? null,
              },
            };
          }
          if (!verification || verification.status !== 'PENDING') {
            throw DriverErrors.verificationNotFound();
          }

          const nextStatus =
            profile.status === 'APPROVED' ? 'APPROVED' : dto.decision;
          const application = await this.onboarding.getApplication(
            profileId,
            client,
          );
          if (
            dto.decision === 'REJECTED' &&
            ![
              ...application.documents,
              ...application.vehicles.flatMap((v) => v.documents),
            ].some((d) => d.status === 'REJECTED' && d.correction)
          )
            throw new BadRequestException(
              'Reject at least one document with correction requirements first',
            );

          if (dto.decision === 'APPROVED') {
            await this.onboarding.assertComplete(profileId, client);
            const app = await this.onboarding.getApplication(profileId, client);
            const licence = app.documents.some(
              (d) =>
                d.document_type === 'DRIVING_LICENCE' &&
                d.status === 'APPROVED' &&
                d.images.length > 0,
            );
            const vehiclesApproved = app.vehicles
              .filter((v) => v.is_active)
              .every((v) =>
                ['RC', 'PUC', 'INSURANCE'].every((type) =>
                  v.documents.some(
                    (d) =>
                      d.document_type === type &&
                      d.status === 'APPROVED' &&
                      d.images.length > 0,
                  ),
                ),
              );
            const allReviewed = [
              ...app.documents,
              ...app.vehicles
                .filter((v) => v.is_active)
                .flatMap((v) => v.documents),
            ]
              .filter((d) => d.images.length > 0 || d.status === 'REJECTED')
              .every((d) => d.status === 'APPROVED');
            const vehicleReviewed = app.vehicles
              .filter((v) => v.is_active)
              .every(
                (v) =>
                  v.details_review_status === 'APPROVED' &&
                  v.photos_review_status === 'APPROVED',
              );
            if (
              !licence ||
              !vehiclesApproved ||
              !allReviewed ||
              !vehicleReviewed
            )
              throw new BadRequestException(
                'Approve all supplied documents, vehicle details, and photos before approving the driver',
              );
          }
          await this.profileRepository.audit(
            profileId,
            'PROFILE',
            null,
            dto.decision,
            adminUserId,
            dto.reason?.trim() || dto.rejection_reason?.trim() || null,
            client,
          );
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
              dto.decision === 'REJECTED'
                ? dto.reason?.trim() || dto.rejection_reason?.trim() || null
                : null,
              client,
              dto.decision === 'REJECTED'
                ? [
                    ...application.documents,
                    ...application.vehicles.flatMap((v) => v.documents),
                  ]
                    .filter((d) => d.status === 'REJECTED' && d.correction)
                    .map((d) => d.id)
                : undefined,
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
        },
      ),
    );
  }

  async reviewDocument(
    documentId: string,
    dto: ReviewDocumentDto,
    adminId: string,
  ) {
    if (!(dto.reason?.trim() || dto.rejection_reason?.trim()))
      throw new BadRequestException('A rejection reason is required');
    let document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw DriverErrors.documentNotFound();
    }

    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminId,
        dto.operation_id,
        `reviewDocument:${documentId}`,
        dto,
        async () => {
          const profile = await this.profileRepository.lockById(
            document.driver_profile_id,
            client,
          );
          if (!profile || profile.status === 'SUSPENDED')
            throw DriverErrors.invalidStatusTransition();
          const latest =
            await this.verificationRepository.findLatestByProfileId(
              profile.id,
              client,
            );
          const status = applicationStatus(profile, latest);
          if (
            dto.decision === 'APPROVED'
              ? status !== 'PENDING_VERIFICATION'
              : !['PENDING_VERIFICATION', 'APPROVED', 'REJECTED'].includes(
                  status,
                )
          )
            throw DriverErrors.invalidStatusTransition();
          document = await this.documentRepository.findById(documentId, client);
          if (!document) throw DriverErrors.documentNotFound();
          assertRevision(document, dto.expected_revision);
          const correctionState =
            dto.decision === 'REJECTED'
              ? makeCorrection(
                  document,
                  dto.correction_mode,
                  dto.metadata_fields,
                )
              : null;
          if (
            dto.decision === 'REJECTED' &&
            dto.correction_mode === 'METADATA' &&
            !(
              await this.imageRepository.listByOwner(
                'DRIVER_DOCUMENT',
                documentId,
                client,
              )
            ).length
          )
            throw new BadRequestException(
              'An image correction is required when no valid image is saved',
            );
          if (
            dto.decision === 'APPROVED' &&
            (
              await this.imageRepository.listByOwner(
                'DRIVER_DOCUMENT',
                documentId,
                client,
              )
            ).length === 0
          )
            throw new BadRequestException(
              'A private document upload is required',
            );
          await this.profileRepository.audit(
            document.driver_profile_id,
            'DRIVER_DOCUMENT',
            documentId,
            dto.decision,
            adminId,
            dto.reason?.trim() || dto.rejection_reason?.trim() || null,
            client,
            correctionState,
          );
          const updated = await this.documentRepository.updateReview(
            documentId,
            dto.decision,
            dto.reason?.trim() || dto.rejection_reason?.trim() || null,
            client,
            JSON.stringify(correctionState),
          );

          if (dto.decision === 'REJECTED')
            await this.openCorrections(
              profile.id,
              adminId,
              dto.reason?.trim() || dto.rejection_reason?.trim() || '',
              client,
            );

          return {
            document: updated
              ? {
                  id: updated.id,
                  revision: updated.revision,
                  correction: parseCorrection(updated.correction),
                  status: updated.status,
                  rejection_reason: updated.rejection_reason,
                  reviewed_at: updated.reviewed_at?.toISOString() ?? null,
                }
              : null,
          };
        },
      ),
    );
  }
  async reviewVehicleDocument(
    documentId: string,
    dto: ReviewDocumentDto,
    adminId: string,
  ) {
    if (!(dto.reason?.trim() || dto.rejection_reason?.trim()))
      throw new BadRequestException('A rejection reason is required');
    let document = await this.vehicleDocumentRepository.findById(documentId);
    if (!document) throw DriverErrors.documentNotFound();
    const vehicle = await this.vehicleRepository.findById(document.vehicle_id);
    if (!vehicle) throw DriverErrors.vehicleNotFound();
    return this.databaseService.withTransaction((client) =>
      adminMutation(
        client,
        adminId,
        dto.operation_id,
        `reviewVehicleDocument:${documentId}`,
        dto,
        async () => {
          const profile = await this.profileRepository.lockById(
            vehicle.driver_profile_id,
            client,
          );
          if (!profile || profile.status === 'SUSPENDED')
            throw DriverErrors.invalidStatusTransition();
          const latest =
            await this.verificationRepository.findLatestByProfileId(
              profile.id,
              client,
            );
          const status = applicationStatus(profile, latest);
          if (
            dto.decision === 'APPROVED'
              ? status !== 'PENDING_VERIFICATION'
              : !['PENDING_VERIFICATION', 'APPROVED', 'REJECTED'].includes(
                  status,
                )
          )
            throw DriverErrors.invalidStatusTransition();
          document = await this.vehicleDocumentRepository.findById(
            documentId,
            client,
          );
          if (!document) throw DriverErrors.documentNotFound();
          assertRevision(document, dto.expected_revision);
          const correctionState =
            dto.decision === 'REJECTED'
              ? makeCorrection(
                  document,
                  dto.correction_mode,
                  dto.metadata_fields,
                  true,
                )
              : null;
          if (
            dto.decision === 'REJECTED' &&
            dto.correction_mode === 'METADATA' &&
            !(
              await this.imageRepository.listByOwner(
                'VEHICLE_DOCUMENT',
                documentId,
                client,
              )
            ).length
          )
            throw new BadRequestException(
              'An image correction is required when no valid image is saved',
            );
          if (
            dto.decision === 'APPROVED' &&
            (
              await this.imageRepository.listByOwner(
                'VEHICLE_DOCUMENT',
                documentId,
                client,
              )
            ).length === 0
          )
            throw new BadRequestException(
              'A private document upload is required',
            );
          const updated = await this.vehicleDocumentRepository.updateReview(
            documentId,
            dto.decision,
            dto.reason?.trim() || dto.rejection_reason?.trim() || null,
            client,
            JSON.stringify(correctionState),
          );
          await this.profileRepository.audit(
            profile.id,
            'VEHICLE_DOCUMENT',
            documentId,
            dto.decision,
            adminId,
            dto.reason?.trim() || dto.rejection_reason?.trim() || null,
            client,
            correctionState,
          );
          if (dto.decision === 'REJECTED')
            await this.openCorrections(
              profile.id,
              adminId,
              dto.reason?.trim() || dto.rejection_reason?.trim() || '',
              client,
            );

          return {
            document: updated
              ? {
                  id: updated.id,
                  revision: updated.revision,
                  correction: parseCorrection(updated.correction),
                  status: updated.status,
                  rejection_reason: updated.rejection_reason,
                  reviewed_at: updated.reviewed_at?.toISOString() ?? null,
                }
              : null,
          };
        },
      ),
    );
  }
}
