import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

import { CLOUDINARY_PROVIDER } from './cloudinary.constants';

export const cloudinaryProvider = {
  provide: CLOUDINARY_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    v2.config({
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });

    return v2;
  },
};
