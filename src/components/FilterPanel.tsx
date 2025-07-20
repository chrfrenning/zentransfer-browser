import React, { useState, useMemo } from 'react';
import type { Photo, FilterState } from '../types';

interface FilterPanelProps {
  photos: Photo[];
  onFilterChange: (filteredPhotos: Photo[]) => void;
}

export function FilterPanel({ photos, onFilterChange }: FilterPanelProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    metadataFilters: {}
  });

  const availableMetadataKeys = useMemo(() => {
    const keys = new Set<string>();
    photos.forEach(photo => {
      if (photo.metadata) {
        Object.keys(photo.metadata).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys).sort();
  }, [photos]);

  const getMetadataValues = (key: string) => {
    const values = new Set<string>();
    photos.forEach(photo => {
      if (photo.metadata && photo.metadata[key] !== undefined) {
        values.add(String(photo.metadata[key]));
      }
    });
    return Array.from(values).sort();
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (filterState.searchTerm) {
        const searchLower = filterState.searchTerm.toLowerCase();
        const filenameMatch = photo.filename.toLowerCase().includes(searchLower);
        const metadataMatch = Object.values(photo.metadata || {}).some(value =>
          String(value).toLowerCase().includes(searchLower)
        );
        if (!filenameMatch && !metadataMatch) return false;
      }

      for (const [key, value] of Object.entries(filterState.metadataFilters)) {
        if (value && photo.metadata?.[key] !== value) {
          return false;
        }
      }

      return true;
    });
  }, [photos, filterState]);

  React.useEffect(() => {
    onFilterChange(filteredPhotos);
  }, [filteredPhotos, onFilterChange]);

  const handleSearchChange = (searchTerm: string) => {
    setFilterState(prev => ({
      ...prev,
      searchTerm
    }));
  };

  const handleMetadataFilterChange = (key: string, value: string) => {
    setFilterState(prev => ({
      ...prev,
      metadataFilters: {
        ...prev.metadataFilters,
        [key]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilterState({
      searchTerm: '',
      metadataFilters: {}
    });
  };

  const hasActiveFilters = filterState.searchTerm || 
    Object.values(filterState.metadataFilters).some(v => v);

  return (
    <div className="bg-white shadow-md p-4 mb-4 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Photos
          </label>
          <input
            type="text"
            id="search"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by filename or metadata..."
            value={filterState.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {availableMetadataKeys.length > 0 && (
          <div className="flex flex-wrap gap-4 lg:flex-nowrap">
            {availableMetadataKeys.slice(0, 3).map(key => (
              <div key={key} className="min-w-0 flex-1">
                <label htmlFor={`filter-${key}`} className="block text-sm font-medium text-gray-700 mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <select
                  id={`filter-${key}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={String(filterState.metadataFilters[key] || '')}
                  onChange={(e) => handleMetadataFilterChange(key, e.target.value)}
                >
                  <option value="">All {key}</option>
                  {getMetadataValues(key).map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {filteredPhotos.length} of {photos.length} photos
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600">
            Filters active
          </span>
        )}
      </div>
    </div>
  );
}