import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldManager } from '../FieldManager';

// Mock the store module
vi.mock('@/store/promptStore', () => {
  return {
    usePromptStore: vi.fn()
  };
});

// Import after mocking
import { usePromptStore } from '@/store/promptStore';

describe('FieldManager', () => {
  const mockAddCustomField = vi.fn();
  const mockRemoveCustomField = vi.fn();
  const mockCustomFields = [
    { id: 'field1', name: 'Project', type: 'text', options: [] },
    { id: 'field2', name: 'Priority', type: 'number', options: [] },
    { id: 'field3', name: 'Status', type: 'select', options: ['Draft', 'Review', 'Published'] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: [],
      selectedPromptId: null,
      customFields: mockCustomFields,
      addPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      deletePrompt: vi.fn(),
      selectPrompt: vi.fn(),
      getSelectedPrompt: vi.fn(),
      addCustomField: mockAddCustomField,
      removeCustomField: mockRemoveCustomField,
      updateCustomField: vi.fn(),
      updateLastUsed: vi.fn()
    } as any);
  });

  it('renders the field manager with existing custom fields', () => {
    render(<FieldManager />);
    
    expect(screen.getByText('Custom Fields')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows field types for each custom field', () => {
    render(<FieldManager />);
    
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('number')).toBeInTheDocument();
    expect(screen.getByText('select')).toBeInTheDocument();
  });

  it('opens add field dialog when Add Custom Field button is clicked', async () => {
    render(<FieldManager />);
    
    const addButton = screen.getByRole('button', { name: /add custom field/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/field name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field type/i)).toBeInTheDocument();
    });
  });

  it('creates a new text field', async () => {
    const user = userEvent.setup();
    render(<FieldManager />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    
    // Fill form
    const nameInput = await screen.findByLabelText(/field name/i);
    await user.type(nameInput, 'Company');
    
    const typeSelect = screen.getByLabelText(/field type/i);
    await user.selectOptions(typeSelect, 'text');
    
    // Save
    const saveButton = screen.getByRole('button', { name: /save field/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockAddCustomField).toHaveBeenCalledWith({
        name: 'Company',
        type: 'text',
        options: []
      });
    });
  });

  it('creates a select field with options', async () => {
    const user = userEvent.setup();
    render(<FieldManager />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    
    // Fill form
    const nameInput = await screen.findByLabelText(/field name/i);
    await user.type(nameInput, 'Difficulty');
    
    const typeSelect = screen.getByLabelText(/field type/i);
    await user.selectOptions(typeSelect, 'select');
    
    // Options field should appear
    await waitFor(() => {
      expect(screen.getByLabelText(/options/i)).toBeInTheDocument();
    });
    
    const optionsInput = screen.getByLabelText(/options/i);
    await user.type(optionsInput, 'Easy,Medium,Hard');
    
    // Save
    const saveButton = screen.getByRole('button', { name: /save field/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockAddCustomField).toHaveBeenCalledWith({
        name: 'Difficulty',
        type: 'select',
        options: ['Easy', 'Medium', 'Hard']
      });
    });
  });

  it('validates required field name', async () => {
    render(<FieldManager />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    
    // Try to save without name
    const saveButton = await screen.findByRole('button', { name: /save field/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Field name is required')).toBeInTheDocument();
      expect(mockAddCustomField).not.toHaveBeenCalled();
    });
  });

  it('prevents duplicate field names', async () => {
    const user = userEvent.setup();
    render(<FieldManager />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    
    // Try to add existing field name
    const nameInput = await screen.findByLabelText(/field name/i);
    await user.type(nameInput, 'Project');
    
    const saveButton = screen.getByRole('button', { name: /save field/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Field name already exists')).toBeInTheDocument();
      expect(mockAddCustomField).not.toHaveBeenCalled();
    });
  });

  it('deletes a custom field with confirmation', async () => {
    render(<FieldManager />);
    
    // Click delete button for first field
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockRemoveCustomField).toHaveBeenCalledWith('field1');
    });
  });

  it('cancels field deletion', async () => {
    render(<FieldManager />);
    
    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Cancel deletion
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(mockRemoveCustomField).not.toHaveBeenCalled();
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  it('closes add field dialog on cancel', async () => {
    render(<FieldManager />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /add custom field/i }));
    
    // Cancel
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});