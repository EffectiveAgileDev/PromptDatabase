import { useAppStore } from '@/store/promptStore';
import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;
import { useSortedAndFilteredPrompts } from '@/hooks/useSortedAndFilteredPrompts';
import { PromptListHeader } from './PromptListHeader';
import { PromptListItem } from './PromptListItem';

export function PromptList() {
  const {
    prompts,
    selectPrompt,
    setSortField,
    setSortDirection,
  } = useAppStore();

  const sortedPrompts = useSortedAndFilteredPrompts(
    prompts.items,
    {
      field: prompts.sortField,
      direction: prompts.sortDirection,
    },
    prompts.searchQuery,
    prompts.searchField
  );

  const handlePromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleSort = (field: keyof Prompt) => {
    if (prompts.sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(prompts.sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (sortedPrompts.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-8 text-gray-500">
        <p>No prompts found</p>
        <p className="text-sm mt-2">Create your first prompt to get started</p>
      </div>
    );
  }

  return (
    <div data-testid="prompt-list" className="space-y-4">
      <PromptListHeader
        sortField={prompts.sortField}
        sortDirection={prompts.sortDirection}
        onSort={handleSort}
      />

      {sortedPrompts.map((prompt) => (
        <PromptListItem
          key={prompt.id}
          prompt={prompt}
          isSelected={prompts.selectedId === prompt.id}
          onClick={handlePromptClick}
        />
      ))}
    </div>
  );
}