import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

export type ApplicationStatus =
  'DRAFT' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
export type MetadataField = 'document_number' | 'expiry_date';
export type CorrectionMode = 'IMAGE' | 'METADATA' | 'BOTH';
export interface Correction {
  mode: CorrectionMode;
  fields: MetadataField[];
  baseline: { document_number: string | null; expiry_date: string | null };
  image_completed: boolean;
}
export interface CorrectionDocument {
  document_type: string;
  status: string;
  revision: number;
  correction: unknown;
  document_number: string | null;
  expiry_date: Date | null;
  rejection_reason: string | null;
}
export function applicationStatus(
  profile: { status: string },
  verification: { status: string } | null,
  application?: {
    compliance_approved: boolean;
    documents: { status: string }[];
    vehicles: {
      details_review_status: string;
      photos_review_status: string;
      documents: { status: string }[];
    }[];
  },
): ApplicationStatus {
  if (profile.status === 'DRAFT') return 'DRAFT';
  if (
    application &&
    (application.documents.some((d) => d.status === 'REJECTED') ||
      application.vehicles.some(
        (v) =>
          v.details_review_status === 'REJECTED' ||
          v.photos_review_status === 'REJECTED' ||
          v.documents.some((d) => d.status === 'REJECTED'),
      ))
  )
    return 'REJECTED';
  if (verification?.status === 'PENDING') return 'PENDING_VERIFICATION';
  if (verification?.status === 'REJECTED') return 'REJECTED';
  if (profile.status === 'PENDING_VERIFICATION') return 'PENDING_VERIFICATION';
  if (profile.status === 'REJECTED') return 'REJECTED';
  return application && !application.compliance_approved
    ? 'PENDING_VERIFICATION'
    : 'APPROVED';
}
export function parseCorrection(value: unknown): Correction | null {
  if (
    !value ||
    typeof value !== 'object' ||
    !('mode' in value) ||
    !['IMAGE', 'METADATA', 'BOTH'].includes(String(value.mode)) ||
    !('fields' in value) ||
    !Array.isArray(value.fields) ||
    !value.fields.every(
      (field) => field === 'document_number' || field === 'expiry_date',
    ) ||
    !('baseline' in value) ||
    !value.baseline ||
    typeof value.baseline !== 'object' ||
    !('document_number' in value.baseline) ||
    !('expiry_date' in value.baseline) ||
    !('image_completed' in value) ||
    typeof value.image_completed !== 'boolean'
  )
    return null;
  const { document_number, expiry_date } = value.baseline;
  if (
    !(document_number === null || typeof document_number === 'string') ||
    !(expiry_date === null || typeof expiry_date === 'string')
  )
    return null;
  return {
    mode: value.mode as CorrectionMode,
    fields: value.fields as MetadataField[],
    baseline: { document_number, expiry_date },
    image_completed: value.image_completed,
  };
}
export function dateOnly(value: Date | null | undefined) {
  if (!value) return null;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export function makeCorrection(
  doc: CorrectionDocument,
  mode: CorrectionMode | undefined,
  fields: MetadataField[] | undefined,
  expirySupported = doc.document_type === 'DRIVING_LICENCE' ||
    ['RC', 'PUC', 'INSURANCE', 'PERMIT'].includes(doc.document_type),
): Correction {
  if (!mode)
    throw new BadRequestException(
      'Select IMAGE, METADATA, or BOTH corrections',
    );
  const selected = [...new Set(fields ?? [])];
  if (mode === 'IMAGE' && selected.length)
    throw new BadRequestException(
      'Image corrections cannot request metadata fields',
    );
  if (mode !== 'IMAGE' && !selected.length)
    throw new BadRequestException(
      'Select metadata fields requiring correction',
    );
  if (selected.includes('expiry_date') && !expirySupported)
    throw new BadRequestException('This document has no expiry date');
  return {
    mode,
    fields: selected,
    baseline: {
      document_number: doc.document_number,
      expiry_date: dateOnly(doc.expiry_date),
    },
    image_completed: false,
  };
}
export function assertRevision(
  doc: { revision: number },
  expected: number | undefined,
) {
  if (expected === undefined || expected !== doc.revision)
    throw new ConflictException(
      'Document changed. Refresh and retry with its current revision.',
    );
}
export function assertDocumentEditable(
  status: ApplicationStatus,
  doc: CorrectionDocument | undefined,
  expected: number | undefined,
  image = false,
) {
  if (doc) assertRevision(doc, expected);
  if (status === 'DRAFT') return;
  const correction = doc && parseCorrection(doc.correction);
  if (status !== 'REJECTED' || doc?.status !== 'REJECTED' || !correction)
    throw new ForbiddenException(
      'Only documents selected for correction can be edited',
    );
  if (image && (correction.mode === 'METADATA' || correction.image_completed))
    throw new ForbiddenException('A replacement image is not required');
}
export function correctedState(
  doc: CorrectionDocument,
  number: string | null,
  expiry: Date | null,
  imageCompleted = false,
) {
  const correction = parseCorrection(doc.correction);
  if (!correction || doc.status !== 'REJECTED')
    return {
      status: 'PENDING' as const,
      correction: null,
      rejectionReason: null,
    };
  const next = {
    ...correction,
    image_completed: correction.image_completed || imageCompleted,
  };
  const metadataComplete = next.fields.every(
    (field) =>
      (field === 'document_number' ? number : dateOnly(expiry)) !==
      next.baseline[field],
  );
  const complete =
    metadataComplete && (next.mode === 'METADATA' || next.image_completed);
  return {
    status: complete ? ('PENDING' as const) : ('REJECTED' as const),
    correction: complete ? null : next,
    rejectionReason: complete ? null : doc.rejection_reason,
  };
}
export function assertMetadataFields(
  doc: CorrectionDocument,
  number: string | null,
  expiry: Date | null,
) {
  const correction = parseCorrection(doc.correction);
  if (doc.status !== 'REJECTED' || !correction) return;
  if (
    (!correction.fields.includes('document_number') &&
      number !== doc.document_number) ||
    (!correction.fields.includes('expiry_date') &&
      dateOnly(expiry) !== dateOnly(doc.expiry_date))
  )
    throw new ForbiddenException(
      'Only the selected metadata fields can be corrected',
    );
}

export function assertSelectedForCorrection(
  status: ApplicationStatus,
  documentId: string | undefined,
  verification: { correction_document_ids: string[] } | null,
) {
  if (
    status === 'REJECTED' &&
    (!documentId || !verification?.correction_document_ids.includes(documentId))
  )
    throw new ForbiddenException(
      'Admin must select this document and return the application for correction first',
    );
}

export function assertVehicleCorrection(
  application: ApplicationStatus,
  vehicle: {
    details_review_status: string;
    photos_review_status: string;
    review_revision: number;
  },
  group: 'DETAILS' | 'PHOTOS',
  expected: number | undefined,
) {
  if (application === 'DRAFT') return;
  if (expected === undefined || expected !== vehicle.review_revision)
    throw new ConflictException('Vehicle review changed. Refresh and retry.');
  if (
    application !== 'REJECTED' ||
    (group === 'DETAILS'
      ? vehicle.details_review_status
      : vehicle.photos_review_status) !== 'REJECTED'
  )
    throw new ForbiddenException(
      'Only vehicle items flagged for correction can be edited',
    );
}
