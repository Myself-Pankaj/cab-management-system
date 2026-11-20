import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaService } from '../../libs/resources/src/media/services/media.service.js';
import { documentImageType } from '../../libs/resources/src/media/types/document-image.js';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR5sAAAAASUVORK5CYII=',
  'base64',
);
describe('Private driver documents', () => {
  const date = new Date();
  const image = {
    id: 'image',
    owner_type: 'DRIVER_DOCUMENT',
    owner_id: 'doc',
    image_type: 'DOCUMENT',
    imagekit_file_id: 'file',
    url: 'https://example.com/private.png',
    file_name: 'document.png',
    mime_type: 'image/png',
    created_at: date,
    updated_at: date,
  };
  const images = {
    create: vi.fn(),
    markPrivate: vi.fn(),
    findById: vi.fn(),
    isPrivate: vi.fn(),
    listByOwner: vi.fn(),
    deleteById: vi.fn(),
  };
  const provider = {
    uploadPrivate: vi.fn(),
    privateContent: vi.fn(),
    deleteFile: vi.fn(),
    getUploadAuth: vi.fn(),
  };
  const profiles = { findByUserId: vi.fn(), lockById: vi.fn() };
  const docs = { findById: vi.fn(), saveState: vi.fn() };
  const vehicles = { listByProfileId: vi.fn().mockResolvedValue([]) };
  const verifications = {
    findLatestByProfileId: vi.fn().mockResolvedValue(null),
  };
  const cleanup = { enqueue: vi.fn(), discard: vi.fn() };
  const users = { findById: vi.fn() };
  const db = { withTransaction: vi.fn(async (work) => work({})) };
  const service = new MediaService(
    images as never,
    provider as never,
    profiles as never,
    docs as never,
    vehicles as never,
    {} as never,
    db as never,
    { errorWithMetadata: vi.fn() } as never,
    users as never,
    verifications as never,
    cleanup as never,
  );
  beforeEach(() => {
    vi.resetAllMocks();
    images.create.mockResolvedValue(image);
    images.listByOwner.mockResolvedValue([]);
    docs.saveState.mockResolvedValue({ revision: 1 });
    vehicles.listByProfileId.mockResolvedValue([]);
    verifications.findLatestByProfileId.mockResolvedValue(null);
    images.findById.mockResolvedValue(image);
    images.isPrivate.mockResolvedValue(true);
    profiles.findByUserId.mockResolvedValue({ id: 'driver' });
    profiles.lockById.mockResolvedValue({ id: 'driver', status: 'DRAFT' });
    docs.findById.mockResolvedValue({
      id: 'doc',
      driver_profile_id: 'driver',
      document_type: 'DRIVING_LICENCE',
      document_number: null,
      expiry_date: null,
      revision: 0,
      correction: null,
      status: 'PENDING',
    });
    provider.uploadPrivate.mockResolvedValue({
      fileId: 'file',
      filePath: '/private.png',
    });
    provider.privateContent.mockResolvedValue(png);
    users.findById.mockResolvedValue({ global_role: 'Driver' });
    db.withTransaction.mockImplementation(async (work) => work({}));
  });
  it('validates bytes rather than the caller MIME type', () => {
    expect(documentImageType(png).mime).toBe('image/png');
    expect(() =>
      documentImageType(Buffer.from('<script>fake.png</script>')),
    ).toThrow('actual JPEG');
    expect(() => documentImageType(Buffer.alloc(10 * 1024 * 1024 + 1))).toThrow(
      '10 MB',
    );
  });
  it('rejects arbitrary document URLs through the public registration endpoint', async () => {
    await expect(
      service.registerImage('user', {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc',
        image_type: 'DOCUMENT',
        imagekit_file_id: 'foreign',
        url: 'https://example.com',
      }),
    ).rejects.toThrow('private document upload');
    expect(images.create).not.toHaveBeenCalled();
  });
  it('uploads privately and returns only an authenticated application URL', async () => {
    const result = await service.uploadDocument('user', {
      owner_type: 'DRIVER_DOCUMENT',
      owner_id: 'doc',
      content_base64: png.toString('base64'),
      expected_revision: 0,
    });
    expect(provider.uploadPrivate).toHaveBeenCalledWith(png, 'doc', 'png');
    expect(images.markPrivate).toHaveBeenCalled();
    expect(result.image.url).toBe('/api/v1/media/documents/image/content');
  });
  it('checks ownership before sending bytes to the provider', async () => {
    profiles.findByUserId.mockResolvedValue({ id: 'another-driver' });
    await expect(
      service.uploadDocument('user', {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc',
        content_base64: png.toString('base64'),
        expected_revision: 0,
      }),
    ).rejects.toThrow();
    expect(provider.uploadPrivate).not.toHaveBeenCalled();
  });
  it('requires an explicit masked Aadhaar declaration', async () => {
    docs.findById.mockResolvedValue({
      driver_profile_id: 'driver',
      document_type: 'AADHAAR',
      revision: 0,
      status: 'PENDING',
    });
    await expect(
      service.uploadDocument('user', {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc',
        content_base64: png.toString('base64'),
        expected_revision: 0,
      }),
    ).rejects.toThrow('masked');
  });
  it('cleans up an uploaded file when attachment fails', async () => {
    profiles.lockById
      .mockResolvedValueOnce({ id: 'driver', status: 'DRAFT' })
      .mockResolvedValueOnce({ id: 'driver', status: 'PENDING_VERIFICATION' });
    await expect(
      service.uploadDocument('user', {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc',
        content_base64: png.toString('base64'),
        expected_revision: 0,
      }),
    ).rejects.toThrow();
    expect(cleanup.discard).toHaveBeenCalledWith('file');
  });
  it('allows only the owner or admin reviewer to view a private image', async () => {
    await expect(
      service.documentContent('user', 'image'),
    ).resolves.toHaveProperty('mime', 'image/png');
    profiles.findByUserId.mockResolvedValue({ id: 'other' });
    await expect(service.documentContent('user', 'image')).rejects.toThrow();
    users.findById.mockResolvedValue({ global_role: 'Admin' });
    await expect(
      service.documentContent('admin', 'image'),
    ).resolves.toHaveProperty('mime', 'image/png');
  });
  it('quarantines legacy images until privacy is verified', async () => {
    images.isPrivate.mockResolvedValue(false);
    await expect(service.documentContent('user', 'image')).rejects.toThrow();
    expect(provider.privateContent).not.toHaveBeenCalled();
  });
});
