export interface PhotoMetadata {
  [key: string]: string | number | boolean | null;
}

export interface RawPhotoData {
  name: string;
  path: string;
  size: number;
  date: string;
  capture_date: string;
  hash: string;
  type: string;
  extension: string;
  thumbnail: string;
  width: number;
  height: number;
  orientation?: number;
  lens?: string;
  lens_make?: string;
  focal_length?: string;
  focal_length_35mm?: string;
  aperture?: number;
  shutter_speed?: string;
  iso?: number;
  exposure_compensation?: number;
  flash?: string;
  white_balance?: string;
  metering_mode?: string;
  [key: string]: any;
}

export interface Photo {
  filename: string;
  url: string;
  thumbnailUrl?: string;
  thumbnailData?: string;
  width: number;
  height: number;
  metadata: PhotoMetadata;
  dateCreated?: string;
  dateModified?: string;
  size?: number;
  hash?: string;
  type?: string;
  extension?: string;
  captureDate?: string;
  tags?: string[];
}

export interface FilterState {
  searchTerm: string;
  metadataFilters: Record<string, string | number | boolean>;
}

export interface MasonryColumn {
  photos: Photo[];
  height: number;
}

export interface PreviewState {
  isOpen: boolean;
  currentIndex: number;
  photos: Photo[];
}