/**
 * SeedPackSelector Component Tests - RED Phase
 * 
 * Tests define expected behavior for selecting seed packs
 * on the Welcome screen.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeedPackSelector } from './SeedPackSelector';

describe('SeedPackSelector Component', () => {
  describe('RED Phase - Component Rendering', () => {
    it('should render all available seed packs', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Writing')).toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
    });

    it('should display pack descriptions', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByText(/programming.*coding.*development/i)).toBeInTheDocument();
      expect(screen.getByText(/content.*writing/i)).toBeInTheDocument();
      expect(screen.getByText(/data.*analysis.*research/i)).toBeInTheDocument();
    });

    it('should display prompt count for each pack', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      // Each pack has 6 prompts
      const promptCounts = screen.getAllByText(/6 prompts/i);
      expect(promptCounts.length).toBe(3);
    });

    it('should render checkboxes for each pack', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(3); // At least 3 packs
    });

    it('should show "Load All" and "Skip" action buttons', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByRole('button', { name: /Load All/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Skip/i })).toBeInTheDocument();
    });
  });

  describe('RED Phase - Pack Selection', () => {
    it('should toggle pack selection when checkbox clicked', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      const devCheckbox = screen.getByLabelText(/Development/i) as HTMLInputElement;
      fireEvent.click(devCheckbox);

      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith(expect.arrayContaining(['development']));
    });

    it('should handle multiple pack selections', () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      const devCheckbox = screen.getByLabelText(/Development/i);
      fireEvent.click(devCheckbox);

      rerender(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockOnChange}
        />
      );

      const writingCheckbox = screen.getByLabelText(/Writing/i);
      fireEvent.click(writingCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['development', 'writing'])
      );
    });

    it('should uncheck pack when clicked again', () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockOnChange}
        />
      );

      const devCheckbox = screen.getByLabelText(/Development/i) as HTMLInputElement;
      expect(devCheckbox.checked).toBe(true);

      fireEvent.click(devCheckbox);

      rerender(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      expect(devCheckbox.checked).toBe(false);
    });
  });

  describe('RED Phase - Action Buttons', () => {
    it('should select all packs when "Load All" clicked', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      const loadAllBtn = screen.getByRole('button', { name: /Load All/i });
      fireEvent.click(loadAllBtn);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['development', 'writing', 'analysis'])
      );
    });

    it('should deselect all packs when "Skip" clicked', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={['development', 'writing', 'analysis']}
          onSelectionChange={mockOnChange}
        />
      );

      const skipBtn = screen.getByRole('button', { name: /Skip/i });
      fireEvent.click(skipBtn);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('RED Phase - Visual State', () => {
    it('should highlight selected packs', () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockOnChange}
        />
      );

      const devCheckbox = screen.getByLabelText(/Development/i) as HTMLInputElement;
      expect(devCheckbox.checked).toBe(true);

      const writingCheckbox = screen.getByLabelText(/Writing/i) as HTMLInputElement;
      expect(writingCheckbox.checked).toBe(false);
    });

    it('should show selection count', () => {
      const mockOnChange = vi.fn();
      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByText(/1.*pack.*selected/i)).toBeInTheDocument();

      rerender(
        <SeedPackSelector
          selectedPacks={['development', 'writing']}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByText(/2.*packs.*selected/i)).toBeInTheDocument();
    });
  });

  describe('RED Phase - Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText(/Development/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Writing/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Analysis/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const mockOnChange = vi.fn();
      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockOnChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least Load All and Skip buttons
    });
  });
});
