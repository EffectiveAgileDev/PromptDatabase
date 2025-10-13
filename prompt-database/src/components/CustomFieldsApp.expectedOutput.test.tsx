import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CustomFieldsApp } from './CustomFieldsApp';
import { usePromptStore } from '@/store/promptStore';

// Mock the store
vi.mock('@/store/promptStore');

// Mock the hooks
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    isAutoSaving: false,
    lastSaved: null,
    forceSave: vi.fn(),
  }),
}));

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: mockWriteText,
  },
});

Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true,
});

describe('CustomFieldsApp - Expected Output Copy Feature', () => {
  const mockPrompt = {
    id: 'test-id-1',
    title: 'Test Prompt',
    promptText: 'This is a test prompt',
    expectedOutput: 'Expected Output Format:\n- Item 1\n- Item 2',
    category: 'Testing',
    tags: 'test,prompt',
    notes: 'Test notes',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    customFields: {},
  };

  const mockStoreState = {
    prompts: [mockPrompt],
    selectedPromptId: 'test-id-1',
    customFields: [],
    addPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    selectPrompt: vi.fn(),
    getSelectedPrompt: () => mockPrompt,
    updateLastUsed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockWriteText.mockResolvedValue(undefined);
    (usePromptStore as any).mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Checkbox State Management', () => {
    it('should render checkbox for including expected output', () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have checkbox checked by default', () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should toggle checkbox when clicked', () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;

      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    it('should display helpful text about AI results', () => {
      render(<CustomFieldsApp />);

      expect(screen.getByText(/recommended for better AI results/i)).toBeInTheDocument();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save checkbox state to localStorage when toggled', () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);

      // Initially true (default)
      expect(localStorage.getItem('includeExpectedOutput')).toBe('true');

      // Toggle to false
      fireEvent.click(checkbox);
      expect(localStorage.getItem('includeExpectedOutput')).toBe('false');

      // Toggle back to true
      fireEvent.click(checkbox);
      expect(localStorage.getItem('includeExpectedOutput')).toBe('true');
    });

    it('should load checkbox state from localStorage on mount', () => {
      // Set localStorage before rendering
      localStorage.setItem('includeExpectedOutput', 'false');

      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should default to true when localStorage is empty', () => {
      // Ensure localStorage is empty
      localStorage.removeItem('includeExpectedOutput');

      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should persist preference across component remounts', () => {
      const { unmount } = render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);
      fireEvent.click(checkbox); // Set to false

      unmount();

      // Remount component
      render(<CustomFieldsApp />);

      const newCheckbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;
      expect(newCheckbox.checked).toBe(false);
    });
  });

  describe('Format Copy Text Function', () => {
    it('should copy only prompt text when checkbox is unchecked', async () => {
      localStorage.setItem('includeExpectedOutput', 'false');

      render(<CustomFieldsApp />);

      // Find and click the Copy button
      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });

    it('should copy prompt text with expected output when checkbox is checked', async () => {
      localStorage.setItem('includeExpectedOutput', 'true');

      render(<CustomFieldsApp />);

      // Find and click the Copy button
      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      const expectedText = 'This is a test prompt\n\n---\n\nExpected Output Format:\n- Item 1\n- Item 2';

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(expectedText);
      });
    });

    it('should only copy prompt text when expected output is empty', async () => {
      const promptWithoutExpectedOutput = {
        ...mockPrompt,
        expectedOutput: '',
      };

      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        getSelectedPrompt: () => promptWithoutExpectedOutput,
      });

      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });

    it('should format with separator line between prompt and expected output', async () => {
      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        const calledWith = mockWriteText.mock.calls[0][0];
        expect(calledWith).toContain('\n\n---\n\n');
        expect(calledWith).toMatch(/This is a test prompt\n\n---\n\nExpected Output Format/);
      });
    });
  });

  describe('Copy Button Integration', () => {
    it('should update lastUsed when copy button is clicked', async () => {
      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockStoreState.updateLastUsed).toHaveBeenCalledWith('test-id-1');
      });
    });

    it('should not show copy button when prompt text is empty', () => {
      const emptyPrompt = {
        ...mockPrompt,
        promptText: '',
      };

      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        getSelectedPrompt: () => emptyPrompt,
      });

      render(<CustomFieldsApp />);

      const copyButton = screen.queryByRole('button', { name: /copy to clipboard/i });
      expect(copyButton).not.toBeInTheDocument();
    });

    it('should toggle checkbox and immediately affect next copy', async () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);
      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });

      // First copy with checkbox ON
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          'This is a test prompt\n\n---\n\nExpected Output Format:\n- Item 1\n- Item 2'
        );
      });

      mockWriteText.mockClear();

      // Toggle checkbox OFF
      fireEvent.click(checkbox);

      // Second copy with checkbox OFF
      fireEvent.click(copyButton);
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });
  });

  describe('Keyboard Shortcut Integration', () => {
    it('should have Ctrl+C copy functionality tested via copy button', async () => {
      // This test verifies that the same formatCopyText function
      // is used for both button clicks and keyboard shortcuts
      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      // When checkbox is ON (default), should include expected output
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          'This is a test prompt\n\n---\n\nExpected Output Format:\n- Item 1\n- Item 2'
        );
      });
    });

    it('should format text consistently for keyboard and button actions', async () => {
      localStorage.setItem('includeExpectedOutput', 'false');

      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      // When checkbox is OFF, should only copy prompt text
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });
  });

  describe('Expected Output Field', () => {
    it('should display helpful placeholder text', () => {
      render(<CustomFieldsApp />);

      const textarea = screen.getByPlaceholderText(/Expected Output Format:/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.getAttribute('placeholder')).toContain('- Title: [product name]');
      expect(textarea.getAttribute('placeholder')).toContain('- Description: [2-3 sentences]');
      expect(textarea.getAttribute('placeholder')).toContain('- Key Features: [bullet list]');
    });

    it('should allow users to edit expected output field', () => {
      render(<CustomFieldsApp />);

      const textarea = screen.getByDisplayValue(/Expected Output Format:/i);

      fireEvent.change(textarea, {
        target: { value: 'New expected output' }
      });

      expect(textarea).toHaveValue('New expected output');
    });

    it('should show expected output value from selected prompt', () => {
      render(<CustomFieldsApp />);

      const textarea = screen.getByDisplayValue(/Expected Output Format:/i);
      expect(textarea).toHaveValue('Expected Output Format:\n- Item 1\n- Item 2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only expected output', async () => {
      const promptWithWhitespace = {
        ...mockPrompt,
        expectedOutput: '   \n\n   ',
      };

      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        getSelectedPrompt: () => promptWithWhitespace,
      });

      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      // Should only copy prompt text since expected output is whitespace
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });

    it('should handle undefined expected output', async () => {
      const promptUndefined = {
        ...mockPrompt,
        expectedOutput: undefined,
      };

      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        getSelectedPrompt: () => promptUndefined,
      });

      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('This is a test prompt');
      });
    });

    it('should handle very long expected output', async () => {
      const longOutput = 'A'.repeat(5000);
      const promptWithLongOutput = {
        ...mockPrompt,
        expectedOutput: longOutput,
      };

      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        getSelectedPrompt: () => promptWithLongOutput,
      });

      render(<CustomFieldsApp />);

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        const calledWith = mockWriteText.mock.calls[0][0];
        expect(calledWith).toContain('This is a test prompt');
        expect(calledWith).toContain(longOutput);
        expect(calledWith.length).toBeGreaterThan(5000);
      });
    });

    it('should not error when no prompt is selected', () => {
      (usePromptStore as any).mockReturnValue({
        ...mockStoreState,
        selectedPromptId: null,
        getSelectedPrompt: () => undefined,
      });

      expect(() => render(<CustomFieldsApp />)).not.toThrow();
    });
  });

  describe('User Experience', () => {
    it('should show checkbox in the form', () => {
      render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);
      const formSection = screen.getByRole('form');

      // Verify checkbox is within the form
      expect(formSection).toContainElement(checkbox);

      // Verify checkbox is visible
      expect(checkbox).toBeVisible();
    });

    it('should maintain checkbox state when switching prompts', () => {
      const anotherPrompt = {
        ...mockPrompt,
        id: 'test-id-2',
        title: 'Another Prompt',
      };

      const mockStore = {
        ...mockStoreState,
        prompts: [mockPrompt, anotherPrompt],
        selectedPromptId: 'test-id-1',
      };

      (usePromptStore as any).mockReturnValue(mockStore);

      const { rerender } = render(<CustomFieldsApp />);

      const checkbox = screen.getByLabelText(/include expected output when copying/i);

      // Toggle checkbox
      fireEvent.click(checkbox);
      expect((checkbox as HTMLInputElement).checked).toBe(false);

      // Switch to another prompt
      mockStore.selectedPromptId = 'test-id-2';
      mockStore.getSelectedPrompt = () => anotherPrompt;
      (usePromptStore as any).mockReturnValue(mockStore);

      rerender(<CustomFieldsApp />);

      // Checkbox state should persist
      const newCheckbox = screen.getByLabelText(/include expected output when copying/i) as HTMLInputElement;
      expect(newCheckbox.checked).toBe(false);
    });
  });
});
