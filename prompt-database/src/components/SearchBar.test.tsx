import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const defaultProps = {
    searchQuery: '',
    searchField: 'title' as const,
    onSearchChange: mockOnSearch,
    onFieldChange: mockOnSearch,
    resultCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RED Phase - Failing Tests', () => {
    it('should render search input field', () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    });

    it('should render field selector dropdown', () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.getByDisplayValue('Title')).toBeInTheDocument();
    });

    it('should display result count when provided', () => {
      render(<SearchBar {...defaultProps} resultCount={5} />);
      expect(screen.getByText('5 results')).toBeInTheDocument();
    });

    it('should display singular result text when count is 1', () => {
      render(<SearchBar {...defaultProps} resultCount={1} />);
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('should call onSearchChange with debounced input', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search by title/i);
      
      await user.type(searchInput, 'test');
      
      // Should not call immediately
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      // Should call after debounce delay
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      }, { timeout: 600 });
    });

    it('should call onFieldChange when dropdown selection changes', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const fieldSelector = screen.getByDisplayValue('Title');
      await user.selectOptions(fieldSelector, 'promptText');
      
      expect(mockOnSearch).toHaveBeenCalledWith('promptText');
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} searchQuery="test query" />);
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);
      
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('should show clear button only when search query is not empty', () => {
      const { rerender } = render(<SearchBar {...defaultProps} />);
      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
      
      rerender(<SearchBar {...defaultProps} searchQuery="test" />);
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<SearchBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search by title/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Search prompts');
      
      const fieldSelector = screen.getByDisplayValue('Title');
      expect(fieldSelector).toHaveAttribute('aria-label', 'Search field selector');
    });

    it('should handle rapid typing with proper debouncing', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search by title/i);
      
      // Type rapidly
      await user.type(searchInput, 'a');
      await user.type(searchInput, 'b');
      await user.type(searchInput, 'c');
      
      // Should only call once after debounce
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledTimes(1);
        expect(mockOnSearch).toHaveBeenCalledWith('abc');
      }, { timeout: 600 });
    });

    it('should display field-specific placeholder text', () => {
      const { rerender } = render(<SearchBar {...defaultProps} searchField="title" />);
      expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
      
      rerender(<SearchBar {...defaultProps} searchField="promptText" />);
      expect(screen.getByPlaceholderText(/search by content/i)).toBeInTheDocument();
      
      rerender(<SearchBar {...defaultProps} searchField="category" />);
      expect(screen.getByPlaceholderText(/search by category/i)).toBeInTheDocument();
      
      rerender(<SearchBar {...defaultProps} searchField="tags" />);
      expect(screen.getByPlaceholderText(/search by tags/i)).toBeInTheDocument();
    });
  });
});