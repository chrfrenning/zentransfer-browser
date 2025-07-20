import { useState, useEffect } from 'react';
import type { Photo, PreviewState } from './types';
import { DataLoader } from './utils/dataLoader';
import { FilterPanel } from './components/FilterPanel';
import { MasonryGrid } from './components/MasonryGrid';
import { PhotoPreview } from './components/PhotoPreview';
import { Footer } from './components/Footer';

function App() {
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    isOpen: false,
    currentIndex: 0,
    photos: []
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dataLoader = DataLoader.getInstance();
      dataLoader.reset();
      const photos = await dataLoader.loadFromJsonLines('./ztindex.jsonl');
      setAllPhotos(photos);
      setFilteredPhotos(photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (_photo: Photo, index: number) => {
    setPreviewState({
      isOpen: true,
      currentIndex: index,
      photos: filteredPhotos
    });
  };

  const handlePreviewClose = () => {
    setPreviewState(prev => ({ ...prev, isOpen: false }));
  };

  const handlePreviewNavigate = (direction: 'prev' | 'next') => {
    setPreviewState(prev => {
      const { currentIndex, photos } = prev;
      let newIndex = currentIndex;
      
      if (direction === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'next' && currentIndex < photos.length - 1) {
        newIndex = currentIndex + 1;
      }
      
      return { ...prev, currentIndex: newIndex };
    });
  };

  const handleFilterChange = (photos: Photo[]) => {
    setFilteredPhotos(photos);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ZenTransfer Portfolio</h1>
            <a 
              href="https://zentransfer.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/zentransfer-logo-sq-250.png" 
                alt="ZenTransfer" 
                className="h-12 w-12"
              />
            </a>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {allPhotos.length > 0 && (
          <FilterPanel
            photos={allPhotos}
            onFilterChange={handleFilterChange}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading photos...</div>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <MasonryGrid
            photos={filteredPhotos}
            onPhotoClick={handlePhotoClick}
          />
        ) : allPhotos.length > 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">No photos match your filters.</div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">Welcome to Photo Portfolio</div>
              <div className="text-sm text-gray-500">Enter a URL to your ztindex.jsonl file above to get started.</div>
            </div>
          </div>
        )}
      </main>

      <PhotoPreview
        previewState={previewState}
        onClose={handlePreviewClose}
        onNavigate={handlePreviewNavigate}
      />
      
      <Footer />
    </div>
  );
}

export default App;