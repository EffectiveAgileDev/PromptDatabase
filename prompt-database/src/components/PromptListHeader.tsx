import { SortField, SortDirection } from '@/lib/storage';

interface PromptListHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function PromptListHeader({ sortField, sortDirection, onSort }: PromptListHeaderProps) {
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <span data-testid="sort-indicator-asc">↑</span>
    ) : (
      <span data-testid="sort-indicator-desc">↓</span>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-2 border-b font-bold text-sm text-gray-900 dark:text-white dark:border-gray-700">
      <button
        data-testid="sort-header-title"
        onClick={() => onSort('title' as SortField)}
        className="text-left hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
      >
        Title {getSortIndicator('title')}
      </button>
      <button
        data-testid="sort-header-category"
        onClick={() => onSort('category' as SortField)}
        className="text-left hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
      >
        Category {getSortIndicator('category')}
      </button>
      <button
        data-testid="sort-header-updatedAt"
        onClick={() => onSort('updatedAt' as SortField)}
        className="text-left hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
      >
        Updated {getSortIndicator('updatedAt')}
      </button>
      <span className="text-left">Tags</span>
    </div>
  );
}