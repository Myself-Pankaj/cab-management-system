import { describe, expect, it } from 'vitest';
import {
  encryptDocument,
  decryptDocument,
} from '../../libs/resources/src/media/types/document-crypto.js';
describe('Document encryption', () => {
  const secret = 'a1'.repeat(32),
    data = Buffer.from('private image contents');
  it('uses randomized authenticated encryption and restores the document', () => {
    const a = encryptDocument(data, secret),
      b = encryptDocument(data, secret);
    expect(a.equals(b)).toBe(false);
    expect(a.includes(data)).toBe(false);
    expect(decryptDocument(a, secret)).toEqual(data);
  });
  it('rejects tampering, unencrypted legacy content and an unavailable key', () => {
    const a = encryptDocument(data, secret);
    a[a.length - 1] ^= 1;
    expect(() => decryptDocument(a, secret)).toThrow();
    expect(() => decryptDocument(data, secret)).toThrow();
    expect(() => encryptDocument(data, '')).toThrow('DOCUMENT_ENCRYPTION_KEY');
  });
});
