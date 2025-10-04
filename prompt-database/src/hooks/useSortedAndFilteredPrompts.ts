import { useMemo } from 'react';
import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

interface SortConfig {
  field: keyof Prompt;
  direction: 'asc' | 'desc';
}

export function useSortedAndFilteredPrompts(
  prompts: Map<string, Prompt>,
  sortConfig: SortConfig,
  searchQuery?: string,
  searchField?: string
) {
  return useMemo(() => {
    let promptsArray = Array.from(prompts.values());

    // Apply search filter
    if (searchQuery && searchField) {
      promptsArray = promptsArray.filter(prompt => {
        const value = prompt[searchField as keyof Prompt];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    }

    // Apply sorting
    promptsArray.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      let comparison = 0;
      
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });

    return promptsArray;
  }, [prompts, sortConfig, searchQuery, searchField]);
}