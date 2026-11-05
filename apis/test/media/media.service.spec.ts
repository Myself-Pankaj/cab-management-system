import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MediaService } from '../../libs/resources/src/media/services/media.service.js';
import { DriverErrors } from '../../libs/resources/src/drivers/types/driver-errors.js';
import { MediaErrors } from '../../libs/resources/src/media/types/media-errors.js';

describe('MediaService', () => {
  const imageRepository = {
    create: vi.fn(),
    findByFileId: vi.fn().mockResolvedValue(null),
    listByOwner: vi.fn(),
    findById: vi.fn(),
    deleteById: vi.fn(),
  };
  const imageKitService = {
    getUploadAuth: vi
      .fn()
      .mockReturnValue({ token: 't', signature: 's', expire: 1 }),
    deleteFile: vi.fn(),
  };
  const profileRepository = { findByUserId: vi.fn(), lockById: vi.fn() };
  const databaseService = { withTransaction: vi.fn(async (work) => work({})) };
  const documentRepository = { findById: vi.fn() };
  const vehicleRepository = { findById: vi.fn() };
  const vehicleDocumentRepository = { findById: vi.fn() };

  let service: MediaService;

  beforeEach(() => {
    vi.clearAllMocks();
    imageRepository.findByFileId.mockResolvedValue(null);
    profileRepository.lockById.mockResolvedValue({
      id: 'profile-1',
      status: 'DRAFT',
    });
    service = new MediaService(
      imageRepository as never,
      imageKitService as never,
      profileRepository as never,
      documentRepository as never,
      vehicleRepository as never,
      vehicleDocumentRepository as never,
      databaseService as never,
    );
  });

  it('returns ImageKit upload auth parameters', () => {
    const auth = service.getUploadAuth();
    expect(auth).toEqual({ token: 't', signature: 's', expire: 1 });
  });

  it('registers image metadata for owned driver document', async () => {
    documentRepository.findById.mockResolvedValue({
      id: 'doc-1',
      driver_profile_id: 'profile-1',
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    imageRepository.create.mockResolvedValue({
      id: 'img-1',
      owner_type: 'DRIVER_DOCUMENT',
      owner_id: 'doc-1',
      image_type: 'DOCUMENT',
      imagekit_file_id: 'file-1',
      url: 'https://ik.imagekit.io/demo/file.jpg',
      file_name: 'file.jpg',
      mime_type: 'image/jpeg',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await service.registerImage('user-1', {
      owner_type: 'DRIVER_DOCUMENT',
      owner_id: 'doc-1',
      image_type: 'DOCUMENT',
      imagekit_file_id: 'file-1',
      url: 'https://ik.imagekit.io/demo/file.jpg',
    });

    expect(result.image.imagekit_file_id).toBe('file-1');
  });

  it('rejects media registration when user does not own the owner record', async () => {
    documentRepository.findById.mockResolvedValue({
      id: 'doc-1',
      driver_profile_id: 'profile-1',
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'other-profile' });

    await expect(
      service.registerImage('user-1', {
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc-1',
        image_type: 'DOCUMENT',
        imagekit_file_id: 'file-1',
        url: 'https://ik.imagekit.io/demo/file.jpg',
      }),
    ).rejects.toEqual(MediaErrors.forbidden());
  });
  it.each(['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED'])(
    'blocks upload registration and deletion in %s',
    async (status) => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      profileRepository.lockById.mockResolvedValue({ id: 'profile-1', status });
      imageRepository.findById.mockResolvedValue({
        id: 'image-1',
        owner_type: 'DRIVER_DOCUMENT',
        owner_id: 'doc-1',
      });
      await expect(
        service.registerImage('user-1', {
          owner_type: 'DRIVER_DOCUMENT',
          owner_id: 'doc-1',
          image_type: 'DOCUMENT',
          imagekit_file_id: 'file-1',
          url: 'https://example.com/doc.jpg',
        }),
      ).rejects.toEqual(DriverErrors.profileNotEditable());
      await expect(service.deleteImage('user-1', 'image-1')).rejects.toEqual(
        DriverErrors.profileNotEditable(),
      );
      expect(imageRepository.create).not.toHaveBeenCalled();
      expect(imageRepository.deleteById).not.toHaveBeenCalled();
      expect(imageKitService.deleteFile).not.toHaveBeenCalled();
    },
  );
  it('returns existing metadata when upload registration is retried', async () => {
    const image = {
      id: 'image-1',
      owner_type: 'DRIVER_DOCUMENT',
      owner_id: 'doc-1',
      image_type: 'DOCUMENT',
      imagekit_file_id: 'file-1',
      url: 'https://example.com/doc.jpg',
      file_name: 'doc.jpg',
      mime_type: 'image/jpeg',
      created_at: new Date(),
      updated_at: new Date(),
    };
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    documentRepository.findById.mockResolvedValue({
      id: 'doc-1',
      driver_profile_id: 'profile-1',
    });
    imageRepository.findByFileId.mockResolvedValue(image);
    const result = await service.registerImage('user-1', {
      owner_type: 'DRIVER_DOCUMENT',
      owner_id: 'doc-1',
      image_type: 'DOCUMENT',
      imagekit_file_id: 'file-1',
      url: image.url,
    });
    expect(result.image.id).toBe(image.id);
    expect(imageRepository.create).not.toHaveBeenCalled();
  });

  it('allows reading owned images while the application is awaiting approval', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    documentRepository.findById.mockResolvedValue({
      id: 'doc-1',
      driver_profile_id: 'profile-1',
    });
    imageRepository.listByOwner.mockResolvedValue([]);
    await expect(
      service.listImages('user-1', 'DRIVER_DOCUMENT', 'doc-1'),
    ).resolves.toEqual({ images: [] });
    expect(profileRepository.lockById).not.toHaveBeenCalled();
  });
});
