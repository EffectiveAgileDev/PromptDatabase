import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

interface PromptListHeaderProps {
  sortField: keyof Prompt;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Prompt) => void;
}

export function PromptListHeader({ sortField, sortDirection, onSort }: PromptListHeaderProps) {
  const getSortIndicator = (field: keyof Prompt) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <span data-testid="sort-indicator-asc">↑</span>
    ) : (
      <span data-testid="sort-indicator-desc">↓</span>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-2 border-b font-semibold text-sm text-gray-700">
      <button
        data-testid="sort-header-title"
        onClick={() => onSort('title')}
        className="text-left hover:text-blue-600 flex items-center gap-1"
      >
        Title {getSortIndicator('title')}
      </button>
      <button
        data-testid="sort-header-category"
        onClick={() => onSort('category')}
        className="text-left hover:text-blue-600 flex items-center gap-1"
      >
        Category {getSortIndicator('category')}
      </button>
      <button
        data-testid="sort-header-updatedAt"
        onClick={() => onSort('updatedAt')}
        className="text-left hover:text-blue-600 flex items-center gap-1"
      >
        Updated {getSortIndicator('updatedAt')}
      </button>
      <span className="text-left">Tags</span>
    </div>
  );
}