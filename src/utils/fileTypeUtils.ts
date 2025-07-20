const RAW_MIME_TYPES = new Set([
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-panasonic-rw2',
  'image/x-olympus-orf',
  'image/x-fuji-raf',
  'image/x-pentax-pef',
  'image/dng',
  'image/x-adobe-dng',
  'image/x-hasselblad-3fr',
  'image/x-phaseone-iiq',
  'image/x-sigma-x3f'
]);

export type FileCategory = 'image' | 'raw' | 'audio' | 'video' | 'other';

export function categorizeFileType(mimeType: string): FileCategory {
  if (!mimeType) return 'other';
  
  const normalizedMimeType = mimeType.toLowerCase().trim();
  
  // Check for RAW files first (they have image/* MIME types but should be categorized as raw)
  if (RAW_MIME_TYPES.has(normalizedMimeType)) {
    return 'raw';
  }
  
  // Get the main type (part before the slash)
  const mainType = normalizedMimeType.split('/')[0];
  
  switch (mainType) {
    case 'image':
      return 'image';
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
    default:
      return 'other';
  }
}

export function getFileTypeLabel(category: FileCategory): string {
  switch (category) {
    case 'image':
      return 'Images';
    case 'raw':
      return 'RAW Files';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Video';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
}