import { useState, useEffect, useMemo } from 'react';
import type { Photo, MasonryColumn } from '../types';

export function useMasonry(photos: Photo[], containerWidth: number, columnWidth: number, gap: number = 16) {
  const [columns, setColumns] = useState<MasonryColumn[]>([]);

  const columnCount = useMemo(() => {
    if (containerWidth <= 0) return 1;
    return Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
  }, [containerWidth, columnWidth, gap]);

  useEffect(() => {
    if (photos.length === 0 || columnCount === 0) {
      setColumns([]);
      return;
    }

    const newColumns: MasonryColumn[] = Array.from({ length: columnCount }, () => ({
      photos: [],
      height: 0
    }));

    photos.forEach((photo) => {
      const shortestColumn = newColumns.reduce((shortest, current, index) => 
        current.height < newColumns[shortest].height ? index : shortest, 0
      );

      const aspectRatio = photo.width / photo.height;
      const displayHeight = Math.round(columnWidth / aspectRatio);

      newColumns[shortestColumn].photos.push(photo);
      newColumns[shortestColumn].height += displayHeight + gap;
    });

    setColumns(newColumns);
  }, [photos, columnCount, columnWidth, gap]);

  return { columns, columnCount };
}