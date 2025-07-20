import { useEffect, useState } from 'react';
import type { PreviewState } from '../types';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface PhotoPreviewProps {
  previewState: PreviewState;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function PhotoPreview({ previewState, onClose, onNavigate }: PhotoPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { isOpen, currentIndex, photos } = previewState;
  const currentPhoto = photos[currentIndex];

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => onNavigate('next'),
    onSwipeRight: () => onNavigate('prev'),
    threshold: 50
  });

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          onNavigate('prev');
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          onNavigate('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentPhoto) {
    return null;
  }

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < photos.length - 1;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      {...swipeHandlers}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-60"
        title="Close (Esc)"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {canGoPrev && (
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-60"
          title="Previous (←)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {canGoNext && (
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-60"
          title="Next (→)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {!imageLoaded && !imageError && (
          <div className="text-white text-xl">Loading...</div>
        )}
        
        {imageError ? (
          <div className="text-white text-center">
            <div className="text-xl mb-2">Failed to load image</div>
            <div className="text-sm text-gray-300">{currentPhoto.filename}</div>
          </div>
        ) : (
          <img
            src={`${currentPhoto.url}.pv.webp`}
            alt={currentPhoto.filename}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-white text-center">
        <div className="bg-black bg-opacity-75 rounded-lg p-4 max-w-3xl mx-auto">
          <div className="font-medium mb-2">{currentPhoto.filename}</div>
          <div className="text-sm text-gray-300 mb-3">
            {currentIndex + 1} of {photos.length} • {currentPhoto.width} × {currentPhoto.height}
            {currentPhoto.size && (
              <span> • {(currentPhoto.size / 1024 / 1024).toFixed(1)} MB</span>
            )}
          </div>
          {currentPhoto.captureDate && (
            <div className="text-xs text-gray-400 mb-2">
              Captured: {new Date(currentPhoto.captureDate).toLocaleDateString()}
            </div>
          )}
          {currentPhoto.metadata && Object.keys(currentPhoto.metadata).length > 0 && (
            <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(currentPhoto.metadata).map(([key, value]) => {
                if (value === null || value === undefined) return null;
                let displayValue = String(value);
                let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                switch (key) {
                  case 'aperture':
                    displayValue = `f/${value}`;
                    break;
                  case 'iso':
                    displayValue = `ISO ${value}`;
                    break;
                  case 'focal_length':
                    displayKey = 'Focal Length';
                    break;
                  case 'focal_length_35mm':
                    displayKey = '35mm Equiv';
                    break;
                  case 'shutter_speed':
                    displayKey = 'Shutter';
                    break;
                  case 'lens_make':
                    displayKey = 'Lens Make';
                    break;
                  case 'white_balance':
                    displayKey = 'White Balance';
                    break;
                  case 'metering_mode':
                    displayKey = 'Metering';
                    break;
                  case 'camera_make':
                    displayKey = 'Camera Make';
                    break;
                  case 'camera_model':
                    displayKey = 'Camera Model';
                    break;
                  case 'exposure_compensation':
                    displayKey = 'Exposure Comp';
                    const numValue = Number(value);
                    displayValue = `${numValue > 0 ? '+' : ''}${numValue} EV`;
                    break;
                }
                
                return (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{displayKey}:</span>
                    <span>{displayValue}</span>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-600">
            <a
              href={currentPhoto.url}
              download={currentPhoto.filename}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Original
            </a>
          </div>
        </div>
      </div>

      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}