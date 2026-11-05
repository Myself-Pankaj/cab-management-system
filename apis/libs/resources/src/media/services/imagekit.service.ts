import { Injectable } from '@nestjs/common';
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

  async deleteFile(fileId: string) {
    if (!this.client) {
      return;
    }
    await this.client.deleteFile(fileId);
  }
}
