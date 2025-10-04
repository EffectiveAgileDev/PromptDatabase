import React, { useState, useEffect, useCallback } from 'react';

export type SearchField = 'title' | 'promptText' | 'category' | 'tags';

interface SearchBarProps {
  searchQuery: string;
  searchField: SearchField;
  onSearchChange: (query: string) => void;
  onFieldChange: (field: SearchField) => void;
  resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchField,
  onSearchChange,
  onFieldChange,
  resultCount = 0,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localQuery !== searchQuery) {
        onSearchChange(localQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, searchQuery, onSearchChange]);

  // Update local query when prop changes
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleFieldChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = event.target.value as SearchField;
    onFieldChange(newField);
  }, [onFieldChange]);

  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    onSearchChange('');
  }, [onSearchChange]);

  const getPlaceholderText = (field: SearchField): string => {
    switch (field) {
      case 'title':
        return 'Search by title...';
      case 'promptText':
        return 'Search by content...';
      case 'category':
        return 'Search by category...';
      case 'tags':
        return 'Search by tags...';
      default:
        return 'Search prompts...';
    }
  };

  const getFieldDisplayName = (field: SearchField): string => {
    switch (field) {
      case 'title':
        return 'Title';
      case 'promptText':
        return 'Content';
      case 'category':
        return 'Category';
      case 'tags':
        return 'Tags';
      default:
        return 'Title';
    }
  };

  const getResultText = (count: number): string => {
    if (count === 1) {
      return '1 result';
    }
    return `${count} results`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-b border-gray-200">
      <div className="flex gap-3 items-center">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={getPlaceholderText(searchField)}
            aria-label="Search prompts"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Field Selector */}
        <select
          value={searchField}
          onChange={handleFieldChange}
          aria-label="Search field selector"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="title">Title</option>
          <option value="promptText">Content</option>
          <option value="category">Category</option>
          <option value="tags">Tags</option>
        </select>
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-600">
          {getResultText(resultCount)}
        </div>
      )}
    </div>
  );
};