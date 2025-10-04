import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptForm } from './PromptForm';
import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

// Mock the store
const mockUseAppStore = vi.fn();
vi.mock('@/store/promptStore', () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe('PromptForm', () => {
  const mockAddPrompt = vi.fn();
  const mockUpdatePrompt = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue({
      addPrompt: mockAddPrompt,
      updatePrompt: mockUpdatePrompt,
      setError: mockSetError,
      prompts: {
        items: new Map(),
      },
    });
  });

  it('renders form fields correctly', () => {
    render(<PromptForm />);
    
    expect(screen.getByTestId('prompt-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-text-input')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-category-select')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-tags-input')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-expected-output-input')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-notes-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-prompt-button')).toBeInTheDocument();
  });

  it('requires title field to be filled', async () => {
    const user = userEvent.setup();
    render(<PromptForm />);
    
    const saveButton = screen.getByTestId('save-prompt-button');
    await user.click(saveButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockAddPrompt).not.toHaveBeenCalled();
  });

  it('creates new prompt when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    render(<PromptForm />);
    
    await user.type(screen.getByTestId('prompt-title-input'), 'Test Prompt');
    await user.type(screen.getByTestId('prompt-text-input'), 'Test prompt text');
    await user.click(screen.getByTestId('save-prompt-button'));
    
    await waitFor(() => {
      expect(mockAddPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Prompt',
          promptText: 'Test prompt text',
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  it('auto-saves after 500ms when editing', async () => {
    const user = userEvent.setup();
    const existingPrompt: Prompt = {
      id: 'test-id',
      title: 'Existing Prompt',
      promptText: 'Existing text',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    render(<PromptForm prompt={existingPrompt} />);
    
    const titleInput = screen.getByTestId('prompt-title-input');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Prompt');
    
    // Wait for debounced auto-save
    await waitFor(() => {
      expect(mockUpdatePrompt).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          title: 'Updated Prompt',
        })
      );
    }, { timeout: 1000 });
  });

  it('shows auto-save indicator when saving', async () => {
    const user = userEvent.setup();
    const existingPrompt: Prompt = {
      id: 'test-id',
      title: 'Existing Prompt',
      promptText: 'Existing text',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    render(<PromptForm prompt={existingPrompt} />);
    
    await user.type(screen.getByTestId('prompt-title-input'), ' Updated');
    
    // Wait for auto-save to trigger
    await waitFor(() => {
      expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('validates title uniqueness', async () => {
    const user = userEvent.setup();
    mockUseAppStore.mockReturnValue({
      addPrompt: mockAddPrompt,
      updatePrompt: mockUpdatePrompt,
      setError: mockSetError,
      prompts: {
        items: new Map([
          ['1', { id: '1', title: 'Existing Title', createdAt: new Date(), updatedAt: new Date() }]
        ])
      }
    });
    
    render(<PromptForm />);
    
    await user.type(screen.getByTestId('prompt-title-input'), 'Existing Title');
    await user.click(screen.getByTestId('save-prompt-button'));
    
    expect(screen.getByText('Title must be unique')).toBeInTheDocument();
    expect(mockAddPrompt).not.toHaveBeenCalled();
  });
});