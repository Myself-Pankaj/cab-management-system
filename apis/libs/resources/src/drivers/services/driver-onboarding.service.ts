import {
  applicationStatus,
  assertVehicleCorrection,
  assertSelectedForCorrection,
  assertDocumentEditable,
  assertMetadataFields,
  correctedState,
  dateOnly,
  parseCorrection,
} from '../types/onboarding-policy.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '@app/core';
import { UserRepository } from '../../auth/repositories/user.repository.js';
import { AuthErrors } from '../../auth/types/auth-errors.js';
import { ImageRepository } from '../../media/repositories/image.repository.js';
import { toImageResponse } from '../../media/types/media.types.js';
import { DriverProfileRepository } from '../repositories/driver-profile.repository.js';
import { DriverDocumentRepository } from '../repositories/driver-document.repository.js';
import { DriverBankAccountRepository } from '../repositories/driver-bank-account.repository.js';
import { VehicleRepository } from '../repositories/vehicle.repository.js';
import { VehicleDocumentRepository } from '../repositories/vehicle-document.repository.js';
import { DriverVerificationRepository } from '../repositories/driver-verification.repository.js';
import { DriverErrors } from '../types/driver-errors.js';
import {
  toDriverProfileResponse,
  type DriverProfileRow,
} from '../types/driver.types.js';
import type { CreateDriverDocumentDto } from '../dto/create-driver-document.dto.js';
import type { UpsertBankDetailsDto } from '../dto/upsert-bank-details.dto.js';
import type { CreateDriverVehicleDto } from '../dto/create-driver-vehicle.dto.js';
import type { CreateVehicleDocumentDto } from '../dto/create-vehicle-document.dto.js';

@Injectable()
export class DriverOnboardingService {
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
  ) {}

  async getMyProfile(userId: string) {
    return {
      profile: toDriverProfileResponse(await this.requireDriverProfile(userId)),
    };
  }

  async getOnboarding(userId: string) {
    const profile = await this.requireDriverProfile(userId);
    const [application, verification] = await Promise.all([
      this.getApplication(profile.id),
      this.verificationRepository.findLatestByProfileId(profile.id),
    ]);
    const status = applicationStatus(profile, verification, application);
    return {
      profile: toDriverProfileResponse(profile),
      application_status: status,
      can_edit_vehicle:
        profile.status !== 'SUSPENDED' &&
        (status === 'DRAFT' ||
          (status === 'REJECTED' &&
            application.vehicles.some(
              (v) => v.details_review_status === 'REJECTED',
            ))) &&
        application.vehicles.length <= 1,
      can_edit_vehicle_photos:
        profile.status !== 'SUSPENDED' &&
        application.vehicles.length <= 1 &&
        (status === 'DRAFT' ||
          (status === 'REJECTED' &&
            application.vehicles.some(
              (v) => v.photos_review_status === 'REJECTED',
            ))),
      can_submit:
        profile.status !== 'SUSPENDED' &&
        ['DRAFT', 'REJECTED'].includes(status) &&
        (status !== 'REJECTED' ||
          !!verification?.correction_document_ids.length ||
          application.vehicles.some(
            (v) => !!v.details_rejection_reason || !!v.photos_rejection_reason,
          )) &&
        application.complete &&
        application.vehicles.length === 1,
      ride_eligible:
        profile.status === 'APPROVED' &&
        application.compliance_approved &&
        status === 'APPROVED',
      ride_eligibility_reason:
        profile.status !== 'APPROVED'
          ? 'ACCOUNT_NOT_APPROVED'
          : !application.compliance_approved
            ? 'VERIFICATION_REQUIREMENTS_NOT_APPROVED'
            : status !== 'APPROVED'
              ? 'APPLICATION_REVIEW_REQUIRED'
              : null,
      ...application,
      verification: verification
        ? {
            id: verification.id,
            status: verification.status,
            correction_document_ids: verification.correction_document_ids,
            rejection_reason: verification.rejection_reason,
            submitted_at: verification.submitted_at.toISOString(),
            reviewed_at: verification.reviewed_at?.toISOString() ?? null,
          }
        : null,
    };
  }

  async getApplication(profileId: string, client?: PoolClient) {
    const [documents, bank, vehicles] = await Promise.all([
      this.documentRepository.listByProfileId(profileId, client),
      this.bankAccountRepository.findByProfileId(profileId, client),
      this.vehicleRepository.listByProfileId(profileId, client),
    ]);
    const documentsWithImages = await Promise.all(
      documents.map(async (doc) => ({
        ...this.toDocumentResponse(doc),
        images: (
          await this.imageRepository.listByOwner(
            'DRIVER_DOCUMENT',
            doc.id,
            client,
          )
        ).map(toImageResponse),
      })),
    );
    const vehiclesWithDocuments = await Promise.all(
      vehicles.map(async (vehicle) => ({
        ...this.toVehicleResponse(vehicle),
        images: (
          await this.imageRepository.listByOwner('VEHICLE', vehicle.id, client)
        ).map(toImageResponse),
        documents: await Promise.all(
          (
            await this.vehicleDocumentRepository.listByVehicleId(
              vehicle.id,
              client,
            )
          ).map(async (doc) => ({
            ...this.toVehicleDocumentResponse(doc),
            images: (
              await this.imageRepository.listByOwner(
                'VEHICLE_DOCUMENT',
                doc.id,
                client,
              )
            ).map(toImageResponse),
          })),
        ),
      })),
    );
    const activeVehicles = vehiclesWithDocuments.filter((v) => v.is_active);
    const hasDocument = (
      docs: { document_type: string; status: string; images: unknown[] }[],
      type: string,
    ) =>
      docs.some(
        (doc) =>
          doc.document_type === type &&
          doc.status !== 'REJECTED' &&
          doc.images.length > 0,
      );
    const checklist = {
      vehicle_photo:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => v.images.length > 0),
      driving_licence: hasDocument(documentsWithImages, 'DRIVING_LICENCE'),
      vehicle:
        activeVehicles.length > 0 &&
        activeVehicles.every(
          (v) => !!v.vehicle_number.trim() && !!v.vehicle_type,
        ),
      rc:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => hasDocument(v.documents, 'RC')),
      insurance:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => hasDocument(v.documents, 'INSURANCE')),
      puc:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => hasDocument(v.documents, 'PUC')),
    };
    return {
      documents: documentsWithImages,
      bank_account: bank ? this.toBankAccountResponse(bank) : null,
      vehicles: vehiclesWithDocuments,
      checklist,
      compliance_approved:
        [...documentsWithImages, ...activeVehicles.flatMap((v) => v.documents)]
          .filter((d) => d.images.length > 0 || d.status === 'REJECTED')
          .every((d) => d.status === 'APPROVED') &&
        activeVehicles.every(
          (v) =>
            v.details_review_status === 'APPROVED' &&
            v.photos_review_status === 'APPROVED',
        ) &&
        documentsWithImages.some(
          (d) =>
            d.document_type === 'DRIVING_LICENCE' &&
            d.status === 'APPROVED' &&
            d.images.length > 0,
        ) &&
        activeVehicles.length > 0 &&
        activeVehicles.every((v) =>
          ['RC', 'PUC', 'INSURANCE'].every((type) =>
            v.documents.some(
              (d) =>
                d.document_type === type &&
                d.status === 'APPROVED' &&
                d.images.length > 0,
            ),
          ),
        ),
      complete:
        Object.values(checklist).every(Boolean) &&
        activeVehicles.every(
          (v) =>
            v.details_review_status !== 'REJECTED' &&
            (v.photos_review_status !== 'REJECTED' ||
              v.photos_correction_completed),
        ) &&
        !documentsWithImages.some((d) => d.status === 'REJECTED') &&
        !activeVehicles.some((v) =>
          v.documents.some((d) => d.status === 'REJECTED'),
        ),
    };
  }

  async assertComplete(profileId: string, client: PoolClient) {
    const application = await this.getApplication(profileId, client);
    if (!application.checklist.vehicle) throw DriverErrors.vehicleRequired();
    if (!application.checklist.vehicle_photo)
      throw DriverErrors.vehiclePhotoRequired();
    if (!application.complete) throw DriverErrors.documentsIncomplete();
  }

  async addDocument(
    userId: string,
    dto: CreateDriverDocumentDto,
    documentId?: string,
  ) {
    if (
      dto.document_type === 'AADHAAR' &&
      dto.document_number &&
      !/^\d{4}$/.test(dto.document_number)
    ) {
      throw new BadRequestException(
        'Supply only the last four Aadhaar digits and upload a masked copy',
      );
    }
    return this.withEditable(
      userId,
      async (profile, client) => {
        const documents = await this.documentRepository.listByProfileId(
          profile.id,
          client,
        );
        const existing = documentId
          ? documents.find((d) => d.id === documentId)
          : (documents.find(
              (d) =>
                d.document_type === dto.document_type &&
                d.status !== 'REJECTED',
            ) ?? documents.find((d) => d.document_type === dto.document_type));
        if (
          documentId &&
          (!existing || existing.document_type !== dto.document_type)
        )
          throw DriverErrors.documentNotFound();
        const verification =
          await this.verificationRepository.findLatestByProfileId(
            profile.id,
            client,
          );
        const status = applicationStatus(profile, verification);
        assertSelectedForCorrection(status, existing?.id, verification);
        assertDocumentEditable(status, existing, dto.expected_revision);
        if (dto.expiry_date && dto.document_type !== 'DRIVING_LICENCE')
          throw new BadRequestException(
            'Only driving licences support expiry dates',
          );
        const number = dto.document_number ?? existing?.document_number ?? null;
        const expiry = dto.expiry_date
          ? new Date(`${dto.expiry_date}T00:00:00`)
          : (existing?.expiry_date ?? null);
        if (existing) assertMetadataFields(existing, number, expiry);
        const state = existing
          ? correctedState(existing, number, expiry)
          : {
              status: 'PENDING' as const,
              rejectionReason: null,
              correction: null,
            };
        const document = existing
          ? await this.documentRepository.saveState(
              {
                id: existing.id,
                expectedRevision: existing.revision,
                documentNumber: number,
                expiryDate: expiry,
                status: state.status,
                rejectionReason: state.rejectionReason,
                correction: state.correction
                  ? JSON.stringify(state.correction)
                  : null,
              },
              client,
            )
          : await this.documentRepository.create(
              {
                driverProfileId: profile.id,
                documentType: dto.document_type,
                documentNumber: number,
                expiryDate: expiry,
                status: 'PENDING',
              },
              client,
            );
        return {
          document: this.toDocumentResponse(document),
          message:
            'Document saved. Upload its private image using /media/documents/upload.',
        };
      },
      true,
    );
  }

  async listDocuments(userId: string) {
    const application = await this.getOnboarding(userId);
    return { documents: application.documents };
  }

  async upsertBankDetails(userId: string, dto: UpsertBankDetailsDto) {
    return this.withEditable(userId, async (profile, client) => {
      const bank = await this.bankAccountRepository.upsert(
        {
          driverProfileId: profile.id,
          accountHolderName: dto.account_holder_name.trim(),
          accountNumber: dto.account_number.trim(),
          ifsc: dto.ifsc.trim().toUpperCase(),
          bankName: dto.bank_name.trim(),
          razorpayFundAccountId: dto.razorpay_fund_account_id ?? null,
        },
        client,
      );
      return { bank_account: this.toBankAccountResponse(bank) };
    });
  }

  async getBankDetails(userId: string) {
    const profile = await this.requireDriverProfile(userId);
    const bank = await this.bankAccountRepository.findByProfileId(profile.id);
    return { bank_account: bank ? this.toBankAccountResponse(bank) : null };
  }

  async addVehicle(
    userId: string,
    dto: CreateDriverVehicleDto,
    vehicleId?: string,
  ) {
    return this.withEditable(
      userId,
      async (profile, client) => {
        const params = {
          driverProfileId: profile.id,
          vehicleNumber: dto.vehicle_number.trim().toUpperCase(),
          vehicleType: dto.vehicle_type,
          make: dto.make ?? null,
          model: dto.model ?? null,
          color: dto.color ?? null,
          manufacturingYear: dto.manufacturing_year ?? null,
        };
        const vehicles = await this.vehicleRepository.listByProfileId(
          profile.id,
          client,
        );
        if (vehicles.length > 1)
          throw new ConflictException(
            'Multiple legacy vehicles require admin resolution',
          );
        const existing = vehicleId
          ? await this.vehicleRepository.findById(vehicleId, client)
          : vehicles[0];
        if (
          !vehicleId &&
          existing &&
          existing.vehicle_number !== params.vehicleNumber
        )
          throw new ConflictException(
            'A vehicle is already registered. Edit the saved vehicle instead.',
          );
        if (
          vehicleId &&
          (!existing || existing.driver_profile_id !== profile.id)
        )
          throw DriverErrors.vehicleNotFound();
        const verification =
          await this.verificationRepository.findLatestByProfileId(
            profile.id,
            client,
          );
        const status = applicationStatus(profile, verification);
        if (status !== 'DRAFT') {
          if (!existing || !vehicleId) throw DriverErrors.vehicleNotFound();
          assertVehicleCorrection(
            status,
            existing,
            'DETAILS',
            dto.expected_revision,
          );
          const unchanged =
            existing.vehicle_number === params.vehicleNumber &&
            existing.vehicle_type === params.vehicleType &&
            existing.make === params.make &&
            existing.model === params.model &&
            existing.color === params.color &&
            existing.manufacturing_year === params.manufacturingYear;
          if (
            (await this.vehicleRepository.blockers(existing.id, client)).length
          )
            throw new ConflictException(
              'Finish or resolve assigned rides before correcting vehicle details',
            );
          if (unchanged)
            throw new BadRequestException(
              'Change the vehicle details requested by admin before saving',
            );
        }
        const vehicle = existing
          ? await this.vehicleRepository.updateDetails(
              existing.id,
              params,
              client,
            )
          : await this.vehicleRepository.create(params, client);
        if (status !== 'DRAFT')
          await this.vehicleRepository.reviewGroup(
            vehicle.id,
            'DETAILS',
            'PENDING',
            existing?.details_rejection_reason ?? null,
            client,
          );
        const saved = await this.vehicleRepository.findById(vehicle.id, client);
        return { vehicle: this.toVehicleResponse(saved ?? vehicle) };
      },
      true,
    );
  }

  async listVehicles(userId: string) {
    const application = await this.getOnboarding(userId);
    return { vehicles: application.vehicles };
  }

  async addVehicleDocument(
    userId: string,
    vehicleId: string,
    dto: CreateVehicleDocumentDto,
    documentId?: string,
  ) {
    return this.withEditable(
      userId,
      async (profile, client) => {
        const vehicle = await this.vehicleRepository.findById(
          vehicleId,
          client,
        );
        if (!vehicle || vehicle.driver_profile_id !== profile.id)
          throw DriverErrors.vehicleNotFound();
        const documents = await this.vehicleDocumentRepository.listByVehicleId(
          vehicleId,
          client,
        );
        const existing = documentId
          ? documents.find((d) => d.id === documentId)
          : (documents.find(
              (d) =>
                d.document_type === dto.document_type &&
                d.status !== 'REJECTED',
            ) ?? documents.find((d) => d.document_type === dto.document_type));
        if (
          documentId &&
          (!existing || existing.document_type !== dto.document_type)
        )
          throw DriverErrors.documentNotFound();
        const verification =
          await this.verificationRepository.findLatestByProfileId(
            profile.id,
            client,
          );
        const status = applicationStatus(profile, verification);
        assertSelectedForCorrection(status, existing?.id, verification);
        assertDocumentEditable(status, existing, dto.expected_revision);
        const number = dto.document_number ?? existing?.document_number ?? null;
        const expiry = dto.expiry_date
          ? new Date(`${dto.expiry_date}T00:00:00`)
          : (existing?.expiry_date ?? null);
        if (existing) assertMetadataFields(existing, number, expiry);
        const state = existing
          ? correctedState(existing, number, expiry)
          : {
              status: 'PENDING' as const,
              rejectionReason: null,
              correction: null,
            };
        const document = existing
          ? await this.vehicleDocumentRepository.saveState(
              {
                id: existing.id,
                expectedRevision: existing.revision,
                documentNumber: number,
                expiryDate: expiry,
                status: state.status,
                rejectionReason: state.rejectionReason,
                correction: state.correction
                  ? JSON.stringify(state.correction)
                  : null,
              },
              client,
            )
          : await this.vehicleDocumentRepository.create(
              {
                vehicleId,
                documentType: dto.document_type,
                documentNumber: number,
                expiryDate: expiry,
                status: 'PENDING',
              },
              client,
            );
        return {
          document: this.toVehicleDocumentResponse(document),
          message:
            'Document saved. Upload its private image using /media/documents/upload.',
        };
      },
      true,
    );
  }

  async submitForVerification(userId: string) {
    const profile = await this.requireDriverProfile(userId);
    return this.databaseService.withTransaction(async (client) => {
      const locked = await this.profileRepository.lockById(profile.id, client);
      if (!locked || locked.status === 'SUSPENDED')
        throw DriverErrors.profileNotEditable();
      const latest = await this.verificationRepository.findLatestByProfileId(
        profile.id,
        client,
      );
      const status = applicationStatus(locked, latest);
      if (status === 'PENDING_VERIFICATION' && latest) {
        return {
          profile: toDriverProfileResponse(locked),
          verification: {
            ...latest,
            submitted_at: latest.submitted_at.toISOString(),
          },
        };
      }
      if (!['DRAFT', 'REJECTED'].includes(status))
        throw DriverErrors.profileNotEditable();
      if (
        status === 'REJECTED' &&
        !latest?.correction_document_ids.length &&
        !(
          await this.vehicleRepository.listByProfileId(profile.id, client)
        ).some(
          (v) => !!v.details_rejection_reason || !!v.photos_rejection_reason,
        )
      )
        throw new BadRequestException(
          'Admin must select correction requirements before this application can be resubmitted',
        );
      const vehicles = await this.vehicleRepository.listByProfileId(
        profile.id,
        client,
      );
      if (vehicles.length !== 1)
        throw new ConflictException(
          'Exactly one vehicle is required; legacy records need admin resolution',
        );
      await this.assertComplete(profile.id, client);
      for (const vehicle of vehicles) {
        if (
          vehicle.photos_review_status === 'REJECTED' &&
          vehicle.photos_correction_completed
        )
          await this.vehicleRepository.reviewGroup(
            vehicle.id,
            'PHOTOS',
            'PENDING',
            null,
            client,
            true,
          );
      }
      const updated =
        locked.status === 'APPROVED'
          ? locked
          : await this.profileRepository.updateStatus(
              profile.id,
              'PENDING_VERIFICATION',
              client,
            );
      if (!updated) throw DriverErrors.profileNotFound();
      const verification = await this.verificationRepository.create(
        profile.id,
        client,
      );
      return {
        profile: toDriverProfileResponse(updated),
        verification: {
          ...verification,
          submitted_at: verification.submitted_at.toISOString(),
        },
      };
    });
  }

  private async requireDriverProfile(
    userId: string,
  ): Promise<DriverProfileRow> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw AuthErrors.userNotFound();
    if (user.global_role !== 'Driver') throw DriverErrors.notDriver();
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw DriverErrors.profileNotFound();
    return profile;
  }

  private async withEditable<T>(
    userId: string,
    work: (profile: DriverProfileRow, client: PoolClient) => Promise<T>,
    corrections = false,
  ) {
    const profile = await this.requireDriverProfile(userId);
    return this.databaseService.withTransaction(async (client) => {
      const locked = await this.profileRepository.lockById(profile.id, client);
      if (!locked) throw DriverErrors.profileNotFound();
      const status = applicationStatus(
        locked,
        await this.verificationRepository.findLatestByProfileId(
          locked.id,
          client,
        ),
      );
      if (
        locked.status === 'SUSPENDED' ||
        (status !== 'DRAFT' && !(corrections && status === 'REJECTED'))
      )
        throw DriverErrors.profileNotEditable();
      if (
        (await this.vehicleRepository.listByProfileId(locked.id, client))
          .length > 1
      )
        throw new ConflictException(
          'Multiple legacy vehicles require admin resolution',
        );
      return work(locked, client);
    });
  }

  private toDocumentResponse(document: {
    id: string;
    driver_profile_id: string;
    document_type: string;
    document_number: string | null;
    status: string;
    rejection_reason: string | null;
    uploaded_at: Date;
    reviewed_at: Date | null;
    revision: number;
    correction: unknown;
    expiry_date: Date | null;
  }) {
    return {
      id: document.id,
      driver_profile_id: document.driver_profile_id,
      expiry_date: dateOnly(document.expiry_date),
      document_type: document.document_type,
      document_number: document.document_number,
      status: document.status,
      revision: document.revision,
      correction: parseCorrection(document.correction),
      rejection_reason: document.rejection_reason,
      uploaded_at: document.uploaded_at.toISOString(),
      reviewed_at: document.reviewed_at?.toISOString() ?? null,
    };
  }

  private toBankAccountResponse(account: {
    id: string;
    driver_profile_id: string;
    account_holder_name: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
    razorpay_fund_account_id: string | null;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: account.id,
      driver_profile_id: account.driver_profile_id,
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      ifsc: account.ifsc,
      bank_name: account.bank_name,
      razorpay_fund_account_id: account.razorpay_fund_account_id,
      is_verified: account.is_verified,
      created_at: account.created_at.toISOString(),
      updated_at: account.updated_at.toISOString(),
    };
  }

  private toVehicleResponse(
    vehicle: NonNullable<Awaited<ReturnType<VehicleRepository['findById']>>>,
  ) {
    return {
      id: vehicle.id,
      driver_profile_id: vehicle.driver_profile_id,
      details_review_status: vehicle.details_review_status,
      photos_review_status: vehicle.photos_review_status,
      details_rejection_reason: vehicle.details_rejection_reason,
      photos_rejection_reason: vehicle.photos_rejection_reason,
      photos_correction_completed: vehicle.photos_correction_completed,
      review_revision: vehicle.review_revision,
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color,
      manufacturing_year: vehicle.manufacturing_year,
      is_active: vehicle.is_active,
      created_at: vehicle.created_at.toISOString(),
      updated_at: vehicle.updated_at.toISOString(),
    };
  }

  private toVehicleDocumentResponse(document: {
    id: string;
    vehicle_id: string;
    document_type: string;
    document_number: string | null;
    expiry_date: Date | null;
    status: string;
    rejection_reason: string | null;
    uploaded_at: Date;
    reviewed_at: Date | null;
    revision: number;
    correction: unknown;
  }) {
    return {
      id: document.id,
      vehicle_id: document.vehicle_id,
      document_type: document.document_type,
      document_number: document.document_number,
      expiry_date: dateOnly(document.expiry_date),
      status: document.status,
      revision: document.revision,
      correction: parseCorrection(document.correction),
      rejection_reason: document.rejection_reason,
      uploaded_at: document.uploaded_at.toISOString(),
      reviewed_at: document.reviewed_at?.toISOString() ?? null,
    };
  }
}
