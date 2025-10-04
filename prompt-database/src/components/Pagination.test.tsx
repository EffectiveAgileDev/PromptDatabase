import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnItemsPerPageChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 20,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should not render when there is only one page', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalItems={10} itemsPerPage={20} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when there are no items', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalItems={0} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should display correct items info', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText('Showing 1 to 20 of 100 results')).toBeInTheDocument();
    });

    it('should display correct items info for last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      expect(screen.getByText('Showing 81 to 100 of 100 results')).toBeInTheDocument();
    });
  });

  describe('Navigation Controls', () => {
    it('should disable Previous button on first page', () => {
      render(<Pagination {...defaultProps} />);
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange when Previous button is clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      await user.click(prevButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when Next button is clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Page Numbers', () => {
    it('should show all page numbers when total pages is small', () => {
      render(<Pagination {...defaultProps} totalItems={80} />); // 4 pages
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
    });

    it('should highlight current page', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);
      
      const currentPageButton = screen.getByLabelText('Page 2');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
      expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should call onPageChange when page number is clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);
      
      const page3Button = screen.getByLabelText('Page 3');
      await user.click(page3Button);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should show ellipsis for large page counts', () => {
      render(<Pagination {...defaultProps} totalItems={1000} currentPage={10} />); // 50 pages
      
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });
  });

  describe('Items Per Page', () => {
    it('should render items per page selector when callback provided', () => {
      render(
        <Pagination
          {...defaultProps}
          onItemsPerPageChange={mockOnItemsPerPageChange}
        />
      );
      
      expect(screen.getByLabelText('Items per page:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });

    it('should not render items per page selector when callback not provided', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.queryByLabelText('Items per page:')).not.toBeInTheDocument();
    });

    it('should call onItemsPerPageChange when selection changes', async () => {
      const user = userEvent.setup();
      render(
        <Pagination
          {...defaultProps}
          onItemsPerPageChange={mockOnItemsPerPageChange}
        />
      );
      
      const selector = screen.getByDisplayValue('20');
      await user.selectOptions(selector, '50');
      
      expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(50);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    });

    it('should use aria-current for current page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const currentPage = screen.getByLabelText('Page 3');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
      
      const otherPage = screen.getByLabelText('Page 2');
      expect(otherPage).not.toHaveAttribute('aria-current');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item correctly', () => {
      render(<Pagination {...defaultProps} totalItems={1} itemsPerPage={20} />);
      // Should not render pagination for single page
      const prevButton = screen.queryByLabelText('Previous page');
      expect(prevButton).not.toBeInTheDocument();
    });

    it('should handle exact page boundary', () => {
      render(<Pagination {...defaultProps} totalItems={100} itemsPerPage={20} currentPage={5} />);
      expect(screen.getByText('Showing 81 to 100 of 100 results')).toBeInTheDocument();
    });

    it('should not call onPageChange when clicking current page', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={2} />);
      
      const currentPageButton = screen.getByLabelText('Page 2');
      await user.click(currentPageButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });
});