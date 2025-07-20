import type { Photo, RawPhotoData } from '../types';

export class DataLoader {
  private static instance: DataLoader;
  private photos: Photo[] = [];
  private loaded = false;

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadFromJsonLines(url: string): Promise<Photo[]> {
    if (this.loaded) {
      return this.photos;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      this.photos = lines.map((line, index) => {
        try {
          const parsed = JSON.parse(line) as RawPhotoData;
          return this.validateAndNormalizePhoto(parsed, index);
        } catch (error) {
          console.warn(`Failed to parse line ${index + 1}:`, error);
          return null;
        }
      }).filter((photo): photo is Photo => photo !== null);

      this.loaded = true;
      return this.photos;
    } catch (error) {
      console.error('Failed to load photo data:', error);
      throw error;
    }
  }

  private validateAndNormalizePhoto(data: RawPhotoData, index: number): Photo | null {
    try {
      const metadata: Record<string, string | number | boolean | null> = {};
      
      const metadataFields = [
        'lens', 'lens_make', 'focal_length', 'focal_length_35mm', 
        'aperture', 'shutter_speed', 'iso', 'exposure_compensation',
        'flash', 'white_balance', 'metering_mode', 'orientation'
      ];
      
      metadataFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null) {
          metadata[field] = data[field];
        }
      });

      const photo: Photo = {
        filename: data.name || `photo-${index}`,
        url: data.path || '',
        thumbnailData: data.thumbnail || undefined,
        width: Number(data.width) || 800,
        height: Number(data.height) || 600,
        metadata,
        dateCreated: data.date,
        captureDate: data.capture_date,
        size: data.size,
        hash: data.hash,
        type: data.type,
        extension: data.extension,
        tags: []
      };

      if (!photo.url && !photo.thumbnailData) {
        console.warn(`Photo at index ${index} missing both URL and thumbnail data, skipping`);
        return null;
      }

      return photo;
    } catch (error) {
      console.warn(`Failed to validate photo at index ${index}:`, error);
      return null;
    }
  }

  getPhotos(): Photo[] {
    return this.photos;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  reset(): void {
    this.photos = [];
    this.loaded = false;
  }
}