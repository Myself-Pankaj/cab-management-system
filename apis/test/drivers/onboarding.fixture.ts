import { vi } from 'vitest';
import type { PoolClient } from 'pg';
import { DriverOnboardingService } from '../../libs/resources/src/drivers/services/driver-onboarding.service.js';

export function onboardingFixture() {
  const date = new Date('2026-01-01');
  const profile = {
    id: 'profile-1',
    user_id: 'user-1',
    status: 'DRAFT',
    created_at: date,
    updated_at: date,
  };
  const driverDocuments = ['AADHAAR', 'DRIVING_LICENCE'].map((type) => ({
    id: type,
    driver_profile_id: profile.id,
    document_type: type,
    document_number: null as string | null,
    expiry_date: null as Date | null,
    revision: 0,
    correction: null as unknown,
    status: 'PENDING',
    rejection_reason: null as string | null,
    uploaded_at: date,
    reviewed_at: null as Date | null,
  }));
  const vehicleDocuments = ['RC', 'PUC', 'INSURANCE'].map((type) => ({
    ...driverDocuments[0],
    id: type,
    vehicle_id: 'vehicle-1',
    document_type: type,
    expiry_date: null,
  }));
  const vehicle = {
    id: 'vehicle-1',
    driver_profile_id: profile.id,
    vehicle_number: 'KA01AB1234',
    details_review_status: 'PENDING',
    photos_review_status: 'PENDING',
    details_rejection_reason: null as string | null,
    photos_rejection_reason: null as string | null,
    photos_correction_completed: false,
    photos_correction_baseline: [] as string[],
    review_revision: 0,
    vehicle_type: 'SEATER_4',
    make: null,
    model: null,
    color: null,
    manufacturing_year: null,
    is_active: true,
    created_at: date,
    updated_at: date,
  };
  const bank = {
    id: 'bank-1',
    driver_profile_id: profile.id,
    account_holder_name: 'Driver',
    account_number: '1234567890',
    ifsc: 'ABCD0123456',
    bank_name: 'Example Bank',
    razorpay_fund_account_id: null,
    is_verified: false,
    created_at: date,
    updated_at: date,
  };
  const verification = {
    id: 'verification-1',
    driver_profile_id: profile.id,
    status: 'PENDING',
    correction_document_ids: [] as string[],
    submitted_at: date,
    reviewed_at: null as Date | null,
    rejection_reason: null as string | null,
  };
  const user = {
    findById: vi
      .fn()
      .mockResolvedValue({ id: 'user-1', global_role: 'Driver' }),
  };
  const profiles = {
    audit: vi.fn(),
    auditHistory: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn().mockResolvedValue(profile),
    lockById: vi.fn().mockResolvedValue(profile),
    updateStatus: vi.fn(async (_id, status) => ({ ...profile, status })),
  };
  const documents = {
    listByProfileId: vi.fn().mockResolvedValue(driverDocuments),
    create: vi.fn(),
    findById: vi.fn(
      async (id) => driverDocuments.find((doc) => doc.id === id) ?? null,
    ),
    saveState: vi.fn(async (params) => {
      const doc = driverDocuments.find((d) => d.id === params.id)!;
      Object.assign(doc, {
        document_number: params.documentNumber,
        expiry_date: params.expiryDate,
        status: params.status,
        rejection_reason: params.rejectionReason,
        correction: params.correction ? JSON.parse(params.correction) : null,
        revision: doc.revision + 1,
      });
      return doc;
    }),
  };
  const banks = {
    findByProfileId: vi.fn().mockResolvedValue(bank),
    upsert: vi.fn().mockResolvedValue(bank),
  };
  const vehicles = {
    listByProfileId: vi.fn().mockResolvedValue([vehicle]),
    findById: vi.fn().mockResolvedValue(vehicle),
    create: vi.fn().mockResolvedValue(vehicle),
    updateDetails: vi.fn().mockResolvedValue(vehicle),
  };
  const vehicleDocs = {
    listByVehicleId: vi.fn().mockResolvedValue(vehicleDocuments),
    create: vi.fn(),
    findById: vi.fn(
      async (id) => vehicleDocuments.find((doc) => doc.id === id) ?? null,
    ),
    saveState: vi.fn(async (params) => {
      const doc = vehicleDocuments.find((d) => d.id === params.id)!;
      Object.assign(doc, {
        document_number: params.documentNumber,
        expiry_date: params.expiryDate,
        status: params.status,
        rejection_reason: params.rejectionReason,
        correction: params.correction ? JSON.parse(params.correction) : null,
        revision: doc.revision + 1,
      });
      return doc;
    }),
  };
  const verifications = {
    create: vi.fn().mockResolvedValue(verification),
    findLatestByProfileId: vi.fn(async () =>
      profile.status === 'DRAFT' ? null : verification,
    ),
  };
  const images = {
    listByOwner: vi.fn(async (_type, id) => [
      {
        id: `img-${id}`,
        owner_id: id,
        owner_type: _type,
        image_type: 'DOCUMENT',
        imagekit_file_id: id,
        url: 'https://example.com/doc.jpg',
        file_name: 'doc.jpg',
        mime_type: 'image/jpeg',
        created_at: date,
        updated_at: date,
      },
    ]),
  };
  const client = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as PoolClient;
  const db = {
    withTransaction: vi.fn(
      async <T>(work: (client: PoolClient) => Promise<T>) => work(client),
    ),
  };
  const service = new DriverOnboardingService(
    user as never,
    profiles as never,
    documents as never,
    banks as never,
    vehicles as never,
    vehicleDocs as never,
    verifications as never,
    images as never,
    db as never,
  );
  return {
    service,
    profile,
    vehicle,
    bank,
    verification,
    driverDocuments,
    vehicleDocuments,
    user,
    profiles,
    documents,
    banks,
    vehicles,
    vehicleDocs,
    verifications,
    images,
    client,
    db,
  };
}
