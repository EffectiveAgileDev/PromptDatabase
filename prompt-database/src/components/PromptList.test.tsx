import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptList } from './PromptList';
import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

// Mock the store
const mockUseAppStore = vi.fn();
vi.mock('@/store/promptStore', () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe('PromptList', () => {
  const mockSelectPrompt = vi.fn();
  const mockDeletePrompt = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetSortField = vi.fn();
  const mockSetSortDirection = vi.fn();

  const samplePrompts: Prompt[] = [
    {
      id: '1',
      title: 'First Prompt',
      promptText: 'First prompt text',
      category: 'Technical',
      tags: 'code, programming',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Second Prompt',
      promptText: 'Second prompt text',
      category: 'Creative',
      tags: 'writing, content',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue({
      prompts: {
        items: new Map(samplePrompts.map(p => [p.id, p])),
        selectedId: null,
        searchQuery: '',
        sortField: 'updatedAt',
        sortDirection: 'desc',
        currentPage: 1,
      },
      selectPrompt: mockSelectPrompt,
      deletePrompt: mockDeletePrompt,
      setSearchQuery: mockSetSearchQuery,
      setSortField: mockSetSortField,
      setSortDirection: mockSetSortDirection,
    });
  });

  it('renders prompt list correctly', () => {
    render(<PromptList />);
    
    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
    expect(screen.getByText('First Prompt')).toBeInTheDocument();
    expect(screen.getByText('Second Prompt')).toBeInTheDocument();
  });

  it('handles prompt selection', async () => {
    const user = userEvent.setup();
    render(<PromptList />);
    
    const firstPrompt = screen.getByTestId('prompt-list-item-1');
    await user.click(firstPrompt);
    
    expect(mockSelectPrompt).toHaveBeenCalledWith('1');
  });

  it('displays selected prompt with visual indicator', () => {
    mockUseAppStore.mockReturnValue({
      prompts: {
        items: new Map(samplePrompts.map(p => [p.id, p])),
        selectedId: '1',
        searchQuery: '',
        sortField: 'updatedAt',
        sortDirection: 'desc',
        currentPage: 1,
      },
      selectPrompt: mockSelectPrompt,
      deletePrompt: mockDeletePrompt,
      setSearchQuery: mockSetSearchQuery,
      setSortField: mockSetSortField,
      setSortDirection: mockSetSortDirection,
    });
    
    render(<PromptList />);
    
    const selectedItem = screen.getByTestId('prompt-list-item-1');
    expect(selectedItem).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('sorts prompts by clicking column headers', async () => {
    const user = userEvent.setup();
    render(<PromptList />);
    
    const titleHeader = screen.getByTestId('sort-header-title');
    await user.click(titleHeader);
    
    expect(mockSetSortField).toHaveBeenCalledWith('title');
  });

  it('toggles sort direction when clicking same header', async () => {
    const user = userEvent.setup();
    mockUseAppStore.mockReturnValue({
      prompts: {
        items: new Map(samplePrompts.map(p => [p.id, p])),
        selectedId: null,
        searchQuery: '',
        sortField: 'title',
        sortDirection: 'asc',
        currentPage: 1,
      },
      selectPrompt: mockSelectPrompt,
      deletePrompt: mockDeletePrompt,
      setSearchQuery: mockSetSearchQuery,
      setSortField: mockSetSortField,
      setSortDirection: mockSetSortDirection,
    });
    
    render(<PromptList />);
    
    const titleHeader = screen.getByTestId('sort-header-title');
    await user.click(titleHeader);
    
    expect(mockSetSortDirection).toHaveBeenCalledWith('desc');
  });

  it('shows sort direction indicators', () => {
    mockUseAppStore.mockReturnValue({
      prompts: {
        items: new Map(samplePrompts.map(p => [p.id, p])),
        selectedId: null,
        searchQuery: '',
        sortField: 'title',
        sortDirection: 'asc',
        currentPage: 1,
      },
      selectPrompt: mockSelectPrompt,
      deletePrompt: mockDeletePrompt,
      setSearchQuery: mockSetSearchQuery,
      setSortField: mockSetSortField,
      setSortDirection: mockSetSortDirection,
    });
    
    render(<PromptList />);
    
    expect(screen.getByTestId('sort-indicator-asc')).toBeInTheDocument();
  });

  it('displays prompt metadata correctly', () => {
    render(<PromptList />);
    
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('code, programming')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-created-at-1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-updated-at-1')).toBeInTheDocument();
  });

  it('shows empty state when no prompts', () => {
    mockUseAppStore.mockReturnValue({
      prompts: {
        items: new Map(),
        selectedId: null,
        searchQuery: '',
        sortField: 'updatedAt',
        sortDirection: 'desc',
        currentPage: 1,
      },
      selectPrompt: mockSelectPrompt,
      deletePrompt: mockDeletePrompt,
      setSearchQuery: mockSetSearchQuery,
      setSortField: mockSetSortField,
      setSortDirection: mockSetSortDirection,
    });
    
    render(<PromptList />);
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No prompts found')).toBeInTheDocument();
  });
});