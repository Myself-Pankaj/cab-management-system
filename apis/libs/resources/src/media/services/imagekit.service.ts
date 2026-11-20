import { encryptDocument, decryptDocument } from '../types/document-crypto.js';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import ImageKit from 'imagekit';
import { AppConfigService } from '@app/core';
import { MediaErrors } from '../types/media-errors.js';

@Injectable()
export class ImageKitService {
  private readonly client: ImageKit | null;

  constructor(private readonly config: AppConfigService) {
    const media = this.config.media;
    if (media.imagekitPublicKey && media.imagekitPrivateKey) {
      this.client = new ImageKit({
        publicKey: media.imagekitPublicKey,
        privateKey: media.imagekitPrivateKey,
        urlEndpoint: media.imagekitUrlEndpoint,
      });
    } else {
      this.client = null;
    }
  }

  getUploadAuth() {
    if (!this.client) {
      throw MediaErrors.imagekitNotConfigured();
    }
    return {
      ...this.client.getAuthenticationParameters(),
      public_key: this.config.media.imagekitPublicKey,
    };
  }

  async uploadVehiclePhoto(data: Buffer, vehicleId: string, extension: string) {
    if (!this.client) throw MediaErrors.imagekitNotConfigured();
    const result = await this.client.upload({
      file: data,
      tags: ['cab-media-staged-v1'],
      fileName: `vehicle.${extension}`,
      folder: `/vehicles/${vehicleId}`,
      isPrivateFile: false,
      useUniqueFileName: true,
    });
    return { fileId: result.fileId, url: result.url };
  }

  async uploadPrivate(
    data: Buffer,
    ownerId: string,
    extension: string,
  ): Promise<{ fileId: string; filePath: string }> {
    if (!this.client) throw MediaErrors.imagekitNotConfigured();
    const encrypted = encryptDocument(
      data,
      this.config.media.documentEncryptionKey,
    );
    const result = await this.client.upload({
      file: encrypted,
      tags: ['cab-media-staged-v1'],
      fileName: `document.${extension}.bin`,
      folder: `/driver-documents/${ownerId}`,
      isPrivateFile: true,
      responseFields: ['isPrivateFile'],
      useUniqueFileName: true,
    });
    try {
      const isPrivate =
        result.isPrivateFile ??
        (await this.client.getFileDetails(result.fileId)).isPrivateFile;
      if (isPrivate !== true)
        throw new ServiceUnavailableException(
          'Private document storage could not be verified',
        );
    } catch (error) {
      await this.client.deleteFile(result.fileId).catch(() => undefined);
      throw error;
    }
    return { fileId: result.fileId, filePath: result.filePath };
  }
  async privateContent(fileId: string) {
    if (!this.client) throw MediaErrors.imagekitNotConfigured();
    const details = await this.client.getFileDetails(fileId);
    if (!details.isPrivateFile) throw MediaErrors.forbidden();
    const url = this.client.url({
      path: details.filePath,
      signed: true,
      expireSeconds: 60,
    });
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!response.ok) throw MediaErrors.imageNotFound();
    const size = Number(response.headers.get('content-length'));
    if (size > 10 * 1024 * 1024 + 35) throw MediaErrors.forbidden();
    if (!response.body) throw MediaErrors.imageNotFound();
    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 10 * 1024 * 1024 + 35) {
          await reader.cancel();
          throw MediaErrors.forbidden();
        }
        chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
    return decryptDocument(
      Buffer.concat(chunks),
      this.config.media.documentEncryptionKey,
    );
  }

  async *stagedFiles() {
    if (!this.client) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (let skip = 0; ; skip += 100) {
      const files = await this.client.listFiles({
        tags: 'cab-media-staged-v1',
        limit: 100,
        skip,
        sort: 'ASC_CREATED',
      });
      for (const file of files) {
        if ('fileId' in file && new Date(file.createdAt).getTime() < cutoff)
          yield file;
      }
      if (files.length < 100) break;
    }
  }

  async deleteFile(fileId: string) {
    if (!this.client) throw MediaErrors.imagekitNotConfigured();
    await this.client.deleteFile(fileId);
  }
}
