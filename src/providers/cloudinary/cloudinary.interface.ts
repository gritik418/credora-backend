import { UploadApiResponse } from 'cloudinary';
import { MediaFile } from 'src/modules/posts/types/post-media.types';

export interface CustomUploadResult extends UploadApiResponse {
  mediaFile: MediaFile;
}
