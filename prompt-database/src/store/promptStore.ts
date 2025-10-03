import { create } from 'zustand';
import { Prompt, Category, AppSettings } from '@/types/prompt';

interface PromptState {
  items: Map<string, Prompt>;
  selectedId: string | null;
  searchQuery: string;
  searchField: string;
  sortField: keyof Prompt;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
}

interface CategoryState {
  items: Category[];
  custom: string[];
}

interface UIState {
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AppState {
  prompts: PromptState;
  categories: CategoryState;
  settings: AppSettings;
  ui: UIState;
}

interface AppActions {
  // Prompt actions
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  selectPrompt: (id: string | null) => void;
  
  // Search and sort actions
  setSearchQuery: (query: string) => void;
  setSearchField: (field: string) => void;
  setSortField: (field: keyof Prompt) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  
  // Category actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  
  // UI actions
  setIsCreating: (isCreating: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  itemsPerPage: 20,
  defaultSortField: 'updatedAt',
  defaultSortDirection: 'desc',
  theme: 'system',
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Initial state
  prompts: {
    items: new Map(),
    selectedId: null,
    searchQuery: '',
    searchField: 'title',
    sortField: 'updatedAt',
    sortDirection: 'desc',
    currentPage: 1,
  },
  categories: {
    items: [],
    custom: [],
  },
  settings: defaultSettings,
  ui: {
    isCreating: false,
    isLoading: false,
    error: null,
  },

  // Actions
  setPrompts: (prompts) => set((state) => ({
    prompts: {
      ...state.prompts,
      items: new Map(prompts.map(p => [p.id, p])),
    },
  })),

  addPrompt: (prompt) => set((state) => ({
    prompts: {
      ...state.prompts,
      items: new Map(state.prompts.items).set(prompt.id, prompt),
    },
  })),

  updatePrompt: (id, updates) => set((state) => {
    const items = new Map(state.prompts.items);
    const existing = items.get(id);
    if (existing) {
      items.set(id, { ...existing, ...updates, updatedAt: new Date() });
    }
    return {
      prompts: { ...state.prompts, items },
    };
  }),

  deletePrompt: (id) => set((state) => {
    const items = new Map(state.prompts.items);
    items.delete(id);
    return {
      prompts: {
        ...state.prompts,
        items,
        selectedId: state.prompts.selectedId === id ? null : state.prompts.selectedId,
      },
    };
  }),

  selectPrompt: (id) => set((state) => ({
    prompts: { ...state.prompts, selectedId: id },
  })),

  setSearchQuery: (query) => set((state) => ({
    prompts: { ...state.prompts, searchQuery: query, currentPage: 1 },
  })),

  setSearchField: (field) => set((state) => ({
    prompts: { ...state.prompts, searchField: field, currentPage: 1 },
  })),

  setSortField: (field) => set((state) => ({
    prompts: { ...state.prompts, sortField: field, currentPage: 1 },
  })),

  setSortDirection: (direction) => set((state) => ({
    prompts: { ...state.prompts, sortDirection: direction, currentPage: 1 },
  })),

  setCurrentPage: (page) => set((state) => ({
    prompts: { ...state.prompts, currentPage: page },
  })),

  setCategories: (categories) => set((state) => ({
    categories: { ...state.categories, items: categories },
  })),

  addCategory: (category) => set((state) => ({
    categories: {
      ...state.categories,
      items: [...state.categories.items, category],
    },
  })),

  setIsCreating: (isCreating) => set((state) => ({
    ui: { ...state.ui, isCreating },
  })),

  setIsLoading: (isLoading) => set((state) => ({
    ui: { ...state.ui, isLoading },
  })),

  setError: (error) => set((state) => ({
    ui: { ...state.ui, error },
  })),

  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),
}));