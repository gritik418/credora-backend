import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { CLOUDINARY_PROVIDER } from './cloudinary.constants';
import { CustomUploadResult } from './cloudinary.interface';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY_PROVIDER) private readonly cloudinary: typeof v2,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CustomUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error('Cloudinary upload failed.'));
          }

          result.mediaFile = file;

          resolve(result as CustomUploadResult);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
