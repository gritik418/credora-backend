import { MEDIA_EXTENSIONS, MediaType } from '../types/post-media.types';

export function categorizeMedia(filename: string): MediaType | null {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (!extension) {
    return null;
  }

  for (const [type, extensions] of Object.entries(MEDIA_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      return type as MediaType;
    }
  }

  return null;
}
