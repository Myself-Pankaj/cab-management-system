import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaService } from '../../libs/resources/src/media/services/media.service.js';
import { DriverErrors } from '../../libs/resources/src/drivers/types/driver-errors.js';
import { UploadVehiclePhotoDto } from '../../libs/resources/src/media/dto/upload-vehicle-photo.dto.js';
import { ValidationPipe } from '@nestjs/common';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR5sAAAAASUVORK5CYII=',
  'base64',
);

describe('Vehicle photo uploads', () => {
  const image = {
    id: 'image',
    owner_type: 'VEHICLE',
    owner_id: 'vehicle',
    image_type: 'PHOTO',
    imagekit_file_id: 'file',
    url: 'https://example.com/vehicle.png',
    file_name: 'vehicle.png',
    mime_type: 'image/png',
    created_at: new Date(),
    updated_at: new Date(),
  };
  const images = { create: vi.fn() };
  const provider = { uploadVehiclePhoto: vi.fn(), deleteFile: vi.fn() };
  const profiles = { findByUserId: vi.fn(), lockById: vi.fn() };
  const vehicles = {
    findById: vi.fn(),
    listByProfileId: vi.fn(),
    photoCorrected: vi.fn(),
  };
  const verifications = { findLatestByProfileId: vi.fn() };
  const cleanup = { discard: vi.fn() };
  const client = {};
  const db = { withTransaction: vi.fn(async (work) => work(client)) };
  const service = new MediaService(
    images as never,
    provider as never,
    profiles as never,
    {} as never,
    vehicles as never,
    {} as never,
    db as never,
    {} as never,
    {} as never,
    verifications as never,
    cleanup as never,
  );
  const upload = () =>
    service.uploadVehiclePhoto('user', 'vehicle', {
      content_base64: png.toString('base64'),
    });

  beforeEach(() => {
    vi.resetAllMocks();
    images.create.mockResolvedValue(image);
    vehicles.listByProfileId.mockResolvedValue([]);
    verifications.findLatestByProfileId.mockResolvedValue(null);
    provider.uploadVehiclePhoto.mockResolvedValue({
      fileId: 'file',
      url: image.url,
    });
    provider.deleteFile.mockResolvedValue(undefined);
    profiles.findByUserId.mockResolvedValue({ id: 'driver' });
    profiles.lockById.mockResolvedValue({ id: 'driver', status: 'DRAFT' });
    vehicles.findById.mockResolvedValue({
      id: 'vehicle',
      driver_profile_id: 'driver',
    });
    db.withTransaction.mockImplementation(async (work) => work(client));
  });

  it('uploads a standard photo and attaches metadata under the vehicle owner', async () => {
    await expect(upload()).resolves.toHaveProperty('image.url', image.url);
    expect(provider.uploadVehiclePhoto).toHaveBeenCalledWith(
      png,
      'vehicle',
      'png',
    );
    expect(images.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'VEHICLE',
        ownerId: 'vehicle',
        imageType: 'PHOTO',
        mimeType: 'image/png',
        url: image.url,
      }),
      client,
    );
    expect(profiles.lockById).toHaveBeenCalledTimes(2);
  });

  it.each([Buffer.from('<svg></svg>'), Buffer.alloc(10 * 1024 * 1024 + 1)])(
    'rejects invalid or oversized bytes before uploading',
    async (data) => {
      await expect(
        service.uploadVehiclePhoto('user', 'vehicle', {
          content_base64: data.toString('base64'),
        }),
      ).rejects.toThrow();
      expect(provider.uploadVehiclePhoto).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid base64 at the HTTP validation boundary', async () => {
    await expect(
      new ValidationPipe({ transform: true }).transform(
        { content_base64: 'not base64!' },
        { type: 'body', metatype: UploadVehiclePhotoDto },
      ),
    ).rejects.toThrow();
  });

  it('rejects another driver’s vehicle before uploading', async () => {
    vehicles.findById.mockResolvedValue({
      driver_profile_id: 'another-driver',
    });
    await expect(upload()).rejects.toThrow();
    expect(provider.uploadVehiclePhoto).not.toHaveBeenCalled();
  });

  it('rejects a missing vehicle before uploading', async () => {
    vehicles.findById.mockResolvedValue(null);
    await expect(upload()).rejects.toThrow();
    expect(provider.uploadVehiclePhoto).not.toHaveBeenCalled();
  });

  it.each(['PENDING_VERIFICATION', 'APPROVED', 'SUSPENDED'])(
    'rejects uploads in %s before contacting ImageKit',
    async (status) => {
      profiles.lockById.mockResolvedValue({ status });
      await expect(upload()).rejects.toEqual(DriverErrors.profileNotEditable());
      expect(provider.uploadVehiclePhoto).not.toHaveBeenCalled();
    },
  );

  it('locks vehicle photos on rejected applications', async () => {
    profiles.lockById.mockResolvedValue({ status: 'REJECTED' });
    await expect(upload()).rejects.toEqual(DriverErrors.profileNotEditable());
  });

  it('cleans up when application submission races with uploading', async () => {
    profiles.lockById
      .mockResolvedValueOnce({ status: 'DRAFT' })
      .mockResolvedValueOnce({ status: 'PENDING_VERIFICATION' });
    await expect(upload()).rejects.toEqual(DriverErrors.profileNotEditable());
    expect(cleanup.discard).toHaveBeenCalledWith('file');
    expect(images.create).not.toHaveBeenCalled();
  });

  it('cleans up after an attachment error and preserves the original failure', async () => {
    const failure = new Error('Database failed');
    images.create.mockRejectedValue(failure);
    provider.deleteFile.mockRejectedValue(new Error('Cleanup failed'));
    await expect(upload()).rejects.toBe(failure);
    expect(cleanup.discard).toHaveBeenCalledWith('file');
  });

  it('does not attach metadata if ImageKit fails', async () => {
    provider.uploadVehiclePhoto.mockRejectedValue(
      new Error('ImageKit unavailable'),
    );
    await expect(upload()).rejects.toThrow('ImageKit unavailable');
    expect(images.create).not.toHaveBeenCalled();
  });
});
