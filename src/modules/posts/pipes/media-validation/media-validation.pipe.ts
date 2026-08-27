import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { categorizeMedia } from '../../utils/media-categorizer.util';
import { MediaFile } from '../../types/post-media.types';

@Injectable()
export class MediaValidationPipe implements PipeTransform {
  transform(files: any, metadata: ArgumentMetadata) {
    if (!files) return;

    if (!Array.isArray(files))
      throw new BadRequestException('Media must be an array.');

    for (const file of files) {
      const type = categorizeMedia(file.originalname);
      if (!type) throw new BadRequestException('Invalid file type.');
    }

    if (!files.length)
      throw new BadRequestException('Media array cannot be empty.');

    if (files.length > 10)
      throw new BadRequestException('Maximum 10 media files are allowed.');

    for (const file of files as MediaFile[]) {
      const fileExtension = file.originalname.split('.').pop();
      if (!fileExtension) throw new BadRequestException('Invalid file.');

      const ALLOWED_MEDIA_EXTENSIONS = [
        // Images
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',

        // Videos
        'mp4',
        'webm',
        'mov',

        // Documents
        'pdf',
        'doc',
        'docx',
        'ppt',
        'pptx',
        'xls',
        'xlsx',
      ];

      const type = categorizeMedia(file.originalname);

      if (!type) throw new BadRequestException('Invalid file type.');

      file.mediaType = type;
      file.extension = fileExtension;

      if (!ALLOWED_MEDIA_EXTENSIONS.includes(fileExtension.toLowerCase()))
        throw new BadRequestException('Invalid file type.');

      if (file.size > 10 * 1024 * 1024)
        throw new BadRequestException('File size must be less than 10MB.');
    }

    return files;
  }
}
