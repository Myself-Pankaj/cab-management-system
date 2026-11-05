import { registerAs } from '@nestjs/config';
import { MediaConfig } from './config.interface.js';

export default registerAs(
  'media',
  (): MediaConfig => ({
    imagekitPublicKey: process.env['IMAGEKIT_PUBLIC_KEY'] ?? '',
    imagekitPrivateKey: process.env['IMAGEKIT_PRIVATE_KEY'] ?? '',
    imagekitUrlEndpoint:
      process.env['IMAGEKIT_URL_ENDPOINT'] ?? 'https://ik.imagekit.io/demo',
  }),
);
