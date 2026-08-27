export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export interface MediaFile extends Express.Multer.File {
  extension: string;
  mediaType: MediaType;
}

export const MEDIA_EXTENSIONS = {
  [MediaType.IMAGE]: ['jpg', 'jpeg', 'png', 'webp', 'gif'],

  [MediaType.VIDEO]: ['mp4', 'webm', 'mov'],

  [MediaType.DOCUMENT]: [
    'pdf',
    'doc',
    'docx',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'csv',
    'txt',
  ],
};
