import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY_PROVIDER } from './cloudinary.constants';

@Global()
@Module({
  providers: [
    CloudinaryService,
    {
      provide: CLOUDINARY_PROVIDER,
      useFactory: (config: ConfigService) => {
        return cloudinary.config({
          cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: config.get<string>('CLOUDINARY_API_KEY'),
          api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class CloudinaryModule {}
