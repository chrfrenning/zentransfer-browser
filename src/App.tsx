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
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

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

  const handleFilterChange = (photos: Photo[], filterCount: number) => {
    setFilteredPhotos(photos);
    setActiveFilterCount(filterCount);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`bg-white shadow-sm border-b sticky top-0 z-40 transition-transform duration-300 ${
        previewState.isOpen ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ZenTransfer Portfolio</h1>
            
            <div className="flex items-center gap-4">
              {/* Filter Toggle Button */}
              {allPhotos.length > 0 && (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm transition-all duration-200"
                  >
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                        isFilterExpanded ? 'rotate-180' : 'rotate-0'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {filteredPhotos.length}/{allPhotos.length}
                    </span>
                  </button>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        // We need to access the clearFilters function from FilterPanel
                        // For now, we'll create a handler that resets all filters
                        window.dispatchEvent(new CustomEvent('clearFilters'));
                      }}
                      className="ml-1 w-5 h-5 bg-gray-300 hover:bg-gray-400 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center transition-colors"
                      title="Clear all filters"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              
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
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-4">
        {allPhotos.length > 0 && (
          <FilterPanel
            photos={allPhotos}
            onFilterChange={handleFilterChange}
            isExpanded={isFilterExpanded}
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
              <div className="text-lg text-gray-600 mb-2">Welcome to ZenTransfer Portfolio</div>
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