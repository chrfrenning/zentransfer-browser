import React, { useState, useMemo } from 'react';
import type { Photo, FilterState } from '../types';
import { categorizeFileType, getFileTypeLabel, type FileCategory } from '../utils/fileTypeUtils';

interface FilterPanelProps {
  photos: Photo[];
  onFilterChange: (filteredPhotos: Photo[], filterCount: number) => void;
  isExpanded: boolean;
}

export function FilterPanel({ photos, onFilterChange, isExpanded }: FilterPanelProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    metadataFilters: {},
    fileTypeFilter: ''
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

  const availableFileTypes = useMemo(() => {
    const categories = new Set<FileCategory>();
    photos.forEach(photo => {
      if (photo.type) {
        categories.add(categorizeFileType(photo.type));
      }
    });
    return Array.from(categories).sort();
  }, [photos]);

  const getMetadataValues = (key: string) => {
    const values = new Set<string>();
    photos.forEach(photo => {
      if (photo.metadata && photo.metadata[key] !== undefined) {
        values.add(String(photo.metadata[key]));
      }
    });

    const valuesArray = Array.from(values);

    // Check if all values are numeric for better sorting
    const isNumeric = valuesArray.every(val => !isNaN(Number(val)) && val.trim() !== '');

    if (isNumeric) {
      return valuesArray.sort((a, b) => Number(a) - Number(b));
    } else {
      return valuesArray.sort();
    }
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Text search filter
      if (filterState.searchTerm) {
        const searchLower = filterState.searchTerm.toLowerCase();
        const filenameMatch = photo.filename.toLowerCase().includes(searchLower);
        const metadataMatch = Object.values(photo.metadata || {}).some(value =>
          String(value).toLowerCase().includes(searchLower)
        );
        if (!filenameMatch && !metadataMatch) return false;
      }

      // File type filter
      if (filterState.fileTypeFilter) {
        const photoCategory = photo.type ? categorizeFileType(photo.type) : 'other';
        if (photoCategory !== filterState.fileTypeFilter) {
          return false;
        }
      }

      // Metadata filters
      for (const [key, value] of Object.entries(filterState.metadataFilters)) {
        if (value && String(photo.metadata?.[key]) !== value) {
          return false;
        }
      }

      return true;
    });
  }, [photos, filterState]);

  React.useEffect(() => {
    const activeFilterCount = Object.keys(filterState.metadataFilters).filter(k => filterState.metadataFilters[k]).length +
      (filterState.searchTerm ? 1 : 0) +
      (filterState.fileTypeFilter ? 1 : 0);
    onFilterChange(filteredPhotos, activeFilterCount);
  }, [filteredPhotos, onFilterChange, filterState]);

  // Listen for clear filters event from header
  React.useEffect(() => {
    const handleClearFilters = () => {
      clearFilters();
    };

    window.addEventListener('clearFilters', handleClearFilters);
    return () => window.removeEventListener('clearFilters', handleClearFilters);
  }, []);

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

  const handleFileTypeFilterChange = (value: string) => {
    setFilterState(prev => ({
      ...prev,
      fileTypeFilter: value
    }));
  };

  const clearFilters = () => {
    setFilterState({
      searchTerm: '',
      metadataFilters: {},
      fileTypeFilter: ''
    });
  };

  const hasActiveFilters = filterState.searchTerm ||
    filterState.fileTypeFilter ||
    Object.values(filterState.metadataFilters).some(v => v);


  return (
    <div
      className={`fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded
          ? 'max-h-[32rem] opacity-100 translate-y-0'
          : 'max-h-0 opacity-0 -translate-y-2'
        }`}
    >
      <div className="p-4 space-y-4">
        {/* Search Bar and File Type Filter */}
        <div className="flex gap-4 items-end pt-2">
          {/* File Type Filter */}
          {availableFileTypes.length > 1 && (
            <div className="w-48">
              <label htmlFor="file-type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select
                id="file-type-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterState.fileTypeFilter}
                onChange={(e) => handleFileTypeFilterChange(e.target.value)}
              >
                <option value="">All File Types</option>
                {availableFileTypes.map(category => (
                  <option key={category} value={category}>
                    {getFileTypeLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
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
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Metadata Filters */}
        {availableMetadataKeys.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {availableMetadataKeys.map(key => (
                <div key={key}>
                  <label htmlFor={`filter-${key}`} className="block text-xs font-medium text-gray-600 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <select
                    id={`filter-${key}`}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    value={String(filterState.metadataFilters[key] || '')}
                    onChange={(e) => handleMetadataFilterChange(key, e.target.value)}
                  >
                    <option value="">All</option>
                    {getMetadataValues(key).map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}