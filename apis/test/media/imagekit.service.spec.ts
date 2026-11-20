import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageKitService } from '../../libs/resources/src/media/services/imagekit.service.js';
import { decryptDocument } from '../../libs/resources/src/media/types/document-crypto.js';

const provider = vi.hoisted(() => ({
  upload: vi.fn(),
  getFileDetails: vi.fn(),
  deleteFile: vi.fn(),
}));
vi.mock('imagekit', () => ({
  default: class {
    upload = provider.upload;
    getFileDetails = provider.getFileDetails;
    deleteFile = provider.deleteFile;
  },
}));

describe('ImageKit private document upload', () => {
  const secret = 'ab'.repeat(32);
  const service = new ImageKitService({
    media: {
      imagekitPublicKey: 'test-public',
      imagekitPrivateKey: 'test-private',
      imagekitUrlEndpoint: 'https://example.com',
      documentEncryptionKey: secret,
    },
  } as never);
  const upload = () =>
    service.uploadPrivate(Buffer.from('document'), 'owner', 'png');

  beforeEach(() => {
    vi.resetAllMocks();
    provider.upload.mockResolvedValue({
      fileId: 'file',
      filePath: '/document.bin',
      isPrivateFile: true,
    });
    provider.deleteFile.mockResolvedValue(undefined);
  });

  it('requests the private flag explicitly and uploads encrypted bytes', async () => {
    await expect(upload()).resolves.toEqual({
      fileId: 'file',
      filePath: '/document.bin',
    });
    const options = provider.upload.mock.calls[0][0];
    expect(options).toMatchObject({
      isPrivateFile: true,
      responseFields: ['isPrivateFile'],
    });
    expect(decryptDocument(options.file, secret)).toEqual(
      Buffer.from('document'),
    );
    expect(provider.getFileDetails).not.toHaveBeenCalled();
  });

  it('verifies file details when the upload response omits the private flag', async () => {
    provider.upload.mockResolvedValue({
      fileId: 'file',
      filePath: '/document.bin',
    });
    provider.getFileDetails.mockResolvedValue({ isPrivateFile: true });
    await expect(upload()).resolves.toHaveProperty('fileId', 'file');
    expect(provider.getFileDetails).toHaveBeenCalledWith('file');
    expect(provider.deleteFile).not.toHaveBeenCalled();
  });

  it.each([false, undefined])(
    'rejects and deletes an unverified file (%s)',
    async (isPrivateFile) => {
      provider.upload.mockResolvedValue({
        fileId: 'file',
        filePath: '/document.bin',
      });
      provider.getFileDetails.mockResolvedValue({ isPrivateFile });
      await expect(upload()).rejects.toMatchObject({ status: 503 });
      expect(provider.deleteFile).toHaveBeenCalledWith('file');
    },
  );

  it('rejects an explicitly public upload without reporting an ownership error', async () => {
    provider.upload.mockResolvedValue({ fileId: 'file', isPrivateFile: false });
    await expect(upload()).rejects.toThrow(
      'Private document storage could not be verified',
    );
    expect(provider.deleteFile).toHaveBeenCalledWith('file');
    expect(provider.getFileDetails).not.toHaveBeenCalled();
  });

  it('cleans up after a verification error and preserves the original failure', async () => {
    provider.upload.mockResolvedValue({
      fileId: 'file',
      filePath: '/document.bin',
    });
    const failure = new Error('Verification failed');
    provider.getFileDetails.mockRejectedValue(failure);
    provider.deleteFile.mockRejectedValue(new Error('Cleanup failed'));
    await expect(upload()).rejects.toBe(failure);
    expect(provider.deleteFile).toHaveBeenCalledWith('file');
  });
});
