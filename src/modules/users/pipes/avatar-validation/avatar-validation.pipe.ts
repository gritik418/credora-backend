import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AvatarValidationPipe implements PipeTransform<
  Express.Multer.File | undefined,
  Express.Multer.File | undefined
> {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  private readonly maxFileSize = 2 * 1024 * 1024; // 2 MB

  transform(
    file: Express.Multer.File | undefined,
  ): Express.Multer.File | undefined {
    if (!file) {
      return undefined;
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Avatar must be a JPG, PNG, or WEBP image.',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Avatar image cannot exceed 2 MB.');
    }

    return file;
  }
}
