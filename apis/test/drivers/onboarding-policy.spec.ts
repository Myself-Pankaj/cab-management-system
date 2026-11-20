import { describe, expect, it } from 'vitest';
import {
  applicationStatus,
  assertVehicleCorrection,
  assertDocumentEditable,
  assertMetadataFields,
  correctedState,
  makeCorrection,
  type CorrectionDocument,
} from '../../libs/resources/src/drivers/types/onboarding-policy.js';
const document = (): CorrectionDocument => ({
  document_type: 'DRIVING_LICENCE',
  status: 'REJECTED',
  revision: 2,
  document_number: 'old',
  expiry_date: new Date('2027-01-01'),
  rejection_reason: 'Fix details',
  correction: null,
});
describe('Selective document corrections', () => {
  it.each(['IMAGE', 'METADATA', 'BOTH'] as const)(
    'keeps unfinished %s corrections rejected',
    (mode) => {
      const doc = document();
      doc.correction = makeCorrection(
        doc,
        mode,
        mode === 'IMAGE' ? [] : ['expiry_date'],
      );
      expect(correctedState(doc, 'old', doc.expiry_date).status).toBe(
        'REJECTED',
      );
    },
  );
  it('allows a metadata-only fix without another image', () => {
    const doc = document();
    doc.correction = makeCorrection(doc, 'METADATA', ['expiry_date']);
    expect(correctedState(doc, 'old', new Date('2028-01-01'))).toEqual({
      status: 'PENDING',
      correction: null,
      rejectionReason: null,
    });
    expect(() => assertDocumentEditable('REJECTED', doc, 2, true)).toThrow(
      'replacement image',
    );
  });
  it('allows image-only correction with the same metadata', () => {
    const doc = document();
    doc.correction = makeCorrection(doc, 'IMAGE', []);
    expect(correctedState(doc, 'old', doc.expiry_date, true).status).toBe(
      'PENDING',
    );
  });
  it('supports metadata first, image second', () => {
    const doc = document();
    doc.correction = makeCorrection(doc, 'BOTH', ['expiry_date']);
    const first = correctedState(doc, 'old', new Date('2028-01-01'));
    expect(first.status).toBe('REJECTED');
    Object.assign(doc, {
      correction: first.correction,
      expiry_date: new Date('2028-01-01'),
    });
    expect(correctedState(doc, 'old', doc.expiry_date, true).status).toBe(
      'PENDING',
    );
  });
  it('supports image first, metadata second', () => {
    const doc = document();
    doc.correction = makeCorrection(doc, 'BOTH', ['document_number']);
    const first = correctedState(doc, 'old', doc.expiry_date, true);
    expect(first.status).toBe('REJECTED');
    doc.correction = first.correction;
    expect(correctedState(doc, 'new', doc.expiry_date).status).toBe('PENDING');
  });
  it('requires every selected metadata value to change', () => {
    const doc = document();
    doc.correction = makeCorrection(doc, 'METADATA', [
      'document_number',
      'expiry_date',
    ]);
    expect(correctedState(doc, 'new', doc.expiry_date).status).toBe('REJECTED');
    expect(correctedState(doc, 'new', new Date('2028-01-01')).status).toBe(
      'PENDING',
    );
  });
  it('locks approved, unselected, stale, and legacy rejected documents', () => {
    const doc = document();
    expect(() => assertDocumentEditable('REJECTED', doc, 2)).toThrow(
      'Only documents',
    );
    doc.correction = makeCorrection(doc, 'METADATA', ['expiry_date']);
    expect(() =>
      assertDocumentEditable('REJECTED', { ...doc, status: 'APPROVED' }, 2),
    ).toThrow();
    expect(() => assertDocumentEditable('REJECTED', doc, 1)).toThrow(
      'Document changed',
    );
    expect(() =>
      assertDocumentEditable('PENDING_VERIFICATION', doc, 2),
    ).toThrow();
    expect(() => assertMetadataFields(doc, 'new', doc.expiry_date)).toThrow(
      'selected metadata',
    );
  });
  it('separates approved driver identity from reopened application status', () => {
    expect(
      applicationStatus({ status: 'APPROVED' }, { status: 'REJECTED' }),
    ).toBe('REJECTED');
    expect(
      applicationStatus({ status: 'APPROVED' }, { status: 'PENDING' }),
    ).toBe('PENDING_VERIFICATION');
  });
  it('validates correction modes and metadata fields', () => {
    const doc = document();
    expect(() => makeCorrection(doc, undefined, [])).toThrow();
    expect(() => makeCorrection(doc, 'IMAGE', ['document_number'])).toThrow();
    expect(() => makeCorrection(doc, 'METADATA', [])).toThrow();
    expect(() =>
      makeCorrection({ ...doc, document_type: 'AADHAAR' }, 'METADATA', [
        'expiry_date',
      ]),
    ).toThrow();
  });
});

describe('Selective vehicle corrections', () => {
  const vehicle = {
    details_review_status: 'REJECTED',
    photos_review_status: 'APPROVED',
    review_revision: 3,
  };
  it('unlocks only the flagged group with the current review revision', () => {
    expect(() =>
      assertVehicleCorrection('REJECTED', vehicle, 'DETAILS', 3),
    ).not.toThrow();
    expect(() =>
      assertVehicleCorrection('REJECTED', vehicle, 'PHOTOS', 3),
    ).toThrow('flagged');
    expect(() =>
      assertVehicleCorrection('REJECTED', vehicle, 'DETAILS', 2),
    ).toThrow('review changed');
    expect(() =>
      assertVehicleCorrection('PENDING_VERIFICATION', vehicle, 'DETAILS', 3),
    ).toThrow();
  });
  it('never reports overall approval when uploaded documents or vehicle items need review', () => {
    const app = {
      compliance_approved: false,
      documents: [{ status: 'PENDING' }],
      vehicles: [],
    };
    expect(
      applicationStatus({ status: 'APPROVED' }, { status: 'APPROVED' }, app),
    ).toBe('PENDING_VERIFICATION');
    expect(
      applicationStatus(
        { status: 'APPROVED' },
        { status: 'APPROVED' },
        { ...app, documents: [{ status: 'REJECTED' }] },
      ),
    ).toBe('REJECTED');
    expect(
      applicationStatus(
        { status: 'APPROVED' },
        { status: 'APPROVED' },
        { ...app, documents: [], vehicles: [{ ...vehicle, documents: [] }] },
      ),
    ).toBe('REJECTED');
  });
});
