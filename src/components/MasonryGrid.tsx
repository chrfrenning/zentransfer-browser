import { useRef, useEffect, useState } from 'react';
import type { Photo } from '../types';
import { useMasonry } from '../hooks/useMasonry';
import { PhotoCard } from './PhotoCard';

interface MasonryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
}

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const getColumnWidth = (containerWidth: number) => {
    if (containerWidth < 640) return 150; // mobile
    if (containerWidth < 768) return 200; // tablet
    if (containerWidth < 1024) return 250; // small desktop
    return 300; // large desktop
  };

  const columnWidth = getColumnWidth(containerWidth);
  const gap = 16;
  const { columns } = useMasonry(photos, containerWidth, columnWidth, gap);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getPhotoIndex = (photo: Photo): number => {
    return photos.findIndex(p => p.filename === photo.filename);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full p-4"
      style={{ 
        display: 'flex',
        gap: `${gap}px`,
        alignItems: 'flex-start'
      }}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          style={{ 
            flex: '1 1 0',
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`
          }}
        >
          {column.photos.map((photo) => {
            const photoIndex = getPhotoIndex(photo);
            return (
              <PhotoCard
                key={`${photo.filename}-${photoIndex}`}
                photo={photo}
                width={columnWidth}
                onClick={() => onPhotoClick(photo, photoIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}