import { describe, it, expect } from 'vitest';
import {
  documentFileType,
  documentImageType,
} from '../../libs/resources/src/media/types/document-image.js';
describe('private document file validation', () => {
  const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
  it('accepts a PDF signature and EOF for documents but never vehicle photos', () => {
    expect(documentFileType(pdf)).toEqual({
      mime: 'application/pdf',
      extension: 'pdf',
    });
    expect(() => documentImageType(pdf)).toThrow();
  });
  it.each([
    Buffer.from('fake.pdf'),
    Buffer.from('%PDF-1.7 incomplete'),
    Buffer.alloc(10 * 1024 * 1024 + 1),
  ])('rejects invalid or oversized files', (file) => {
    expect(() => documentFileType(file)).toThrow();
  });
});

import { MediaController } from '../../src/media/media.controller.js';
import type { Response } from 'express';
import { vi } from 'vitest';
describe('private document response headers', () => {
  it('uses protected attachment downloads with no-store and a sandbox policy', async () => {
    const bytes = Buffer.from('%PDF-1.7\n%%EOF');
    const controller = new MediaController({
      documentContent: vi
        .fn()
        .mockResolvedValue({ data: bytes, mime: 'application/pdf' }),
    } as never);
    const send = vi.fn(),
      set = vi.fn().mockReturnValue({ send });
    await controller.viewDocument(
      { user_id: 'admin' } as never,
      'document',
      { set } as unknown as Response,
      '1',
    );
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'attachment; filename="document.pdf"',
        'Content-Security-Policy': "sandbox; default-src 'none'",
      }),
    );
    expect(send).toHaveBeenCalledWith(bytes);
  });
  it('does not send any document bytes when authorization fails', async () => {
    const controller = new MediaController({
      documentContent: vi.fn().mockRejectedValue(new Error('Access denied')),
    } as never);
    const set = vi.fn();
    await expect(
      controller.viewDocument(
        { user_id: 'other' } as never,
        'document',
        { set } as unknown as Response,
        '1',
      ),
    ).rejects.toThrow('Access denied');
    expect(set).not.toHaveBeenCalled();
  });
});
