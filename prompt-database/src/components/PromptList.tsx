import { usePromptStore } from '@/store/promptStore';
import { useSortedAndFilteredPrompts } from '@/hooks/useSortedAndFilteredPrompts';
import { PromptListHeader } from './PromptListHeader';
import { PromptListItem } from './PromptListItem';
import type { SortField } from '@/lib/storage';

export function PromptList() {
  const {
    prompts,
    selectedPromptId,
    selectPrompt,
  } = usePromptStore();

  // For now, we'll use the prompts directly without additional filtering
  // The useSortedAndFilteredPrompts hook can be implemented later if needed
  const displayPrompts = prompts;

  const handlePromptClick = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleSort = (_field: SortField) => {
    // Sorting functionality can be implemented when needed
    // For now, this is a placeholder to prevent errors
  };

  if (displayPrompts.length === 0) {
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
        sortField={'title'}
        sortDirection={'asc'}
        onSort={handleSort}
      />

      {displayPrompts.map((prompt) => (
        <PromptListItem
          key={prompt.id}
          prompt={prompt}
          isSelected={selectedPromptId === prompt.id}
          onClick={handlePromptClick}
        />
      ))}
    </div>
  );
}