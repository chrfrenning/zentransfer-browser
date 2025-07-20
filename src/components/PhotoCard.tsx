import { useState, useMemo } from 'react';
import type { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  width: number;
  onClick: () => void;
}

export function PhotoCard({ photo, width, onClick }: PhotoCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatio = photo.width / photo.height;
  const displayHeight = Math.round(width / aspectRatio);

  const imageSource = useMemo(() => {
    if (photo.thumbnailData) {
      return `data:image/webp;base64,${photo.thumbnailData}`;
    }
    return photo.thumbnailUrl || photo.url;
  }, [photo.thumbnailData, photo.thumbnailUrl, photo.url]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const formatMetadataValue = (key: string, value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return '';
    
    switch (key) {
      case 'aperture':
        return `f/${value}`;
      case 'focal_length':
      case 'focal_length_35mm':
        return String(value);
      case 'iso':
        return `ISO ${value}`;
      case 'shutter_speed':
        return String(value);
      default:
        return String(value);
    }
  };

  return (
    <div
      className="relative cursor-pointer transition-transform duration-200 hover:scale-105 group"
      onClick={onClick}
      style={{ width: `${width}px` }}
    >
      {isLoading && (
        <div
          className="bg-gray-200 animate-pulse rounded-lg"
          style={{ 
            width: `${width}px`, 
            height: `${displayHeight}px` 
          }}
        />
      )}
      
      {hasError ? (
        <div
          className="bg-gray-300 rounded-lg flex items-center justify-center text-gray-500"
          style={{ 
            width: `${width}px`, 
            height: `${displayHeight}px` 
          }}
        >
          <span className="text-sm">Failed to load</span>
        </div>
      ) : (
        <img
          src={imageSource}
          alt={photo.filename}
          className={`w-full rounded-lg object-cover transition-opacity duration-300 relative z-10 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            height: `${displayHeight}px`
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg pointer-events-none" />
      
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <div className="bg-black bg-opacity-75 text-white p-2 rounded text-sm">
          <div className="truncate font-medium">{photo.filename}</div>
          {photo.metadata && Object.keys(photo.metadata).length > 0 && (
            <div className="text-xs text-gray-300 mt-1">
              {Object.entries(photo.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key} className="truncate">
                  {key.replace(/_/g, ' ')}: {formatMetadataValue(key, value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}