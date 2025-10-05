import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyToClipboard } from './CopyToClipboard';

// Mock clipboard API
const mockWriteText = vi.fn();

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: mockWriteText,
  },
});

describe('CopyToClipboard', () => {
  const mockOnCopy = vi.fn();
  const mockOnError = vi.fn();
  
  const defaultProps = {
    text: 'Test content to copy',
    onCopy: mockOnCopy,
    onError: mockOnError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('RED Phase - Failing Tests', () => {
    it('should render copy button with correct label', () => {
      render(<CopyToClipboard {...defaultProps} />);
      expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
    });

    it('should show copy icon by default', () => {
      render(<CopyToClipboard {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button.querySelector('[data-testid="copy-icon"]')).toBeInTheDocument();
    });

    it('should show tooltip on hover', () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Copy prompt to clipboard');
    });

    it('should copy text to clipboard when clicked', async () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockWriteText).toHaveBeenCalledWith('Test content to copy');
    });

    it('should call onCopy callback after successful copy', async () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnCopy).toHaveBeenCalledWith('Test content to copy');
      });
    });

    it('should show loading state while copying', async () => {
      let resolvePromise: () => void;
      const copyPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockWriteText.mockReturnValue(copyPromise);
      
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
      
      resolvePromise!();
      await waitFor(() => {
        expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
      });
    });

    it('should show success state after successful copy', async () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      });
    });

    it('should return to normal state after success timeout', async () => {
      vi.useFakeTimers();
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      });
      
      vi.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('success-icon')).not.toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });

    it('should handle clipboard API errors gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard not available'));
      
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should show error state when copy fails', async () => {
      mockWriteText.mockRejectedValue(new Error('Copy failed'));
      
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      });
    });

    it('should provide fallback when clipboard API not available', async () => {
      // Temporarily remove clipboard API
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: undefined,
      });
      
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/copy manually/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test content to copy')).toBeInTheDocument();
      });
      
      // Restore clipboard for other tests
      Object.defineProperty(navigator, 'clipboard', {
        writable: true,
        value: originalClipboard,
      });
    });

    it('should support custom button text', () => {
      render(<CopyToClipboard {...defaultProps} buttonText="Copy Prompt" />);
      expect(screen.getByText('Copy Prompt')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(mockWriteText).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(<CopyToClipboard {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Copy to clipboard');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should allow custom copy formats', () => {
      const customFormatter = (text: string) => `Formatted: ${text}`;
      
      render(
        <CopyToClipboard 
          {...defaultProps} 
          formatter={customFormatter}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockWriteText).toHaveBeenCalledWith('Formatted: Test content to copy');
    });
  });
});