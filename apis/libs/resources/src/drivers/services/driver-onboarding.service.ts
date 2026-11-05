import { Injectable } from '@nestjs/common';
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
  EDITABLE_DRIVER_PROFILE_STATUSES,
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
    return {
      profile: toDriverProfileResponse(profile),
      ...application,
      verification: verification
        ? {
            id: verification.id,
            status: verification.status,
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
      aadhaar: hasDocument(documentsWithImages, 'AADHAAR'),
      driving_licence: hasDocument(documentsWithImages, 'DRIVING_LICENCE'),
      bank_details:
        !!bank &&
        [
          bank.account_holder_name,
          bank.account_number,
          bank.ifsc,
          bank.bank_name,
        ].every((v) => !!v?.trim()),
      vehicle:
        activeVehicles.length > 0 &&
        activeVehicles.every(
          (v) => !!v.vehicle_number.trim() && !!v.vehicle_type,
        ),
      rc:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => hasDocument(v.documents, 'RC')),
      puc:
        activeVehicles.length > 0 &&
        activeVehicles.every((v) => hasDocument(v.documents, 'PUC')),
    };
    return {
      documents: documentsWithImages,
      bank_account: bank ? this.toBankAccountResponse(bank) : null,
      vehicles: vehiclesWithDocuments,
      checklist,
      complete: Object.values(checklist).every(Boolean),
    };
  }

  async assertComplete(profileId: string, client: PoolClient) {
    const application = await this.getApplication(profileId, client);
    if (!application.checklist.bank_details)
      throw DriverErrors.bankDetailsMissing();
    if (!application.checklist.vehicle) throw DriverErrors.vehicleRequired();
    if (!application.complete) throw DriverErrors.documentsIncomplete();
  }

  async addDocument(
    userId: string,
    dto: CreateDriverDocumentDto,
    documentId?: string,
  ) {
    return this.withEditable(userId, async (profile, client) => {
      const documents = await this.documentRepository.listByProfileId(
        profile.id,
        client,
      );
      const existing = documentId
        ? documents.find((d) => d.id === documentId)
        : (documents.find(
            (d) =>
              d.document_type === dto.document_type && d.status !== 'REJECTED',
          ) ?? documents.find((d) => d.document_type === dto.document_type));
      if (
        documentId &&
        (!existing || existing.document_type !== dto.document_type)
      )
        throw DriverErrors.documentNotFound();
      if (
        existing?.status === 'REJECTED' &&
        documents.some(
          (d) =>
            d.id !== existing.id &&
            d.document_type === dto.document_type &&
            d.status !== 'REJECTED',
        )
      ) {
        throw DriverErrors.invalidStatusTransition();
      }
      const document = existing
        ? await this.documentRepository.updateDetails(
            existing.id,
            dto.document_number ?? existing.document_number,
            client,
          )
        : await this.documentRepository.create(
            {
              driverProfileId: profile.id,
              documentType: dto.document_type,
              documentNumber: dto.document_number ?? null,
              status: 'PENDING',
            },
            client,
          );
      return {
        document: this.toDocumentResponse(document),
        message: 'Document saved. Attach its image using /media.',
      };
    });
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
    return this.withEditable(userId, async (profile, client) => {
      const params = {
        driverProfileId: profile.id,
        vehicleNumber: dto.vehicle_number.trim().toUpperCase(),
        vehicleType: dto.vehicle_type,
        make: dto.make ?? null,
        model: dto.model ?? null,
        color: dto.color ?? null,
        manufacturingYear: dto.manufacturing_year ?? null,
      };
      const existing = vehicleId
        ? await this.vehicleRepository.findById(vehicleId, client)
        : (
            await this.vehicleRepository.listByProfileId(profile.id, client)
          ).find((v) => v.vehicle_number === params.vehicleNumber);
      if (vehicleId && (!existing || existing.driver_profile_id !== profile.id))
        throw DriverErrors.vehicleNotFound();
      const vehicle = existing
        ? await this.vehicleRepository.updateDetails(
            existing.id,
            params,
            client,
          )
        : await this.vehicleRepository.create(params, client);
      return { vehicle: this.toVehicleResponse(vehicle) };
    });
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
    return this.withEditable(userId, async (profile, client) => {
      const vehicle = await this.vehicleRepository.findById(vehicleId, client);
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
              d.document_type === dto.document_type && d.status !== 'REJECTED',
          ) ?? documents.find((d) => d.document_type === dto.document_type));
      if (
        documentId &&
        (!existing || existing.document_type !== dto.document_type)
      )
        throw DriverErrors.documentNotFound();
      const document = existing
        ? await this.vehicleDocumentRepository.updateDetails(
            existing.id,
            dto.document_number ?? existing.document_number,
            dto.expiry_date ? new Date(dto.expiry_date) : existing.expiry_date,
            client,
          )
        : await this.vehicleDocumentRepository.create(
            {
              vehicleId,
              documentType: dto.document_type,
              documentNumber: dto.document_number ?? null,
              expiryDate: dto.expiry_date ? new Date(dto.expiry_date) : null,
              status: 'PENDING',
            },
            client,
          );
      return {
        document: this.toVehicleDocumentResponse(document),
        message: 'Document saved. Attach its image using /media.',
      };
    });
  }

  async submitForVerification(userId: string) {
    return this.withEditable(userId, async (profile, client) => {
      await this.assertComplete(profile.id, client);
      const updated = await this.profileRepository.updateStatus(
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
          id: verification.id,
          driver_profile_id: verification.driver_profile_id,
          status: verification.status,
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
  ) {
    const profile = await this.requireDriverProfile(userId);
    return this.databaseService.withTransaction(async (client) => {
      const locked = await this.profileRepository.lockById(profile.id, client);
      if (!locked) throw DriverErrors.profileNotFound();
      if (!EDITABLE_DRIVER_PROFILE_STATUSES.includes(locked.status))
        throw DriverErrors.profileNotEditable();
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
  }) {
    return {
      id: document.id,
      driver_profile_id: document.driver_profile_id,
      document_type: document.document_type,
      document_number: document.document_number,
      status: document.status,
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

  private toVehicleResponse(vehicle: {
    id: string;
    driver_profile_id: string;
    vehicle_number: string;
    vehicle_type: string | null;
    make: string | null;
    model: string | null;
    color: string | null;
    manufacturing_year: number | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: vehicle.id,
      driver_profile_id: vehicle.driver_profile_id,
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
  }) {
    return {
      id: document.id,
      vehicle_id: document.vehicle_id,
      document_type: document.document_type,
      document_number: document.document_number,
      expiry_date: document.expiry_date?.toISOString().slice(0, 10) ?? null,
      status: document.status,
      rejection_reason: document.rejection_reason,
      uploaded_at: document.uploaded_at.toISOString(),
      reviewed_at: document.reviewed_at?.toISOString() ?? null,
    };
  }
}
