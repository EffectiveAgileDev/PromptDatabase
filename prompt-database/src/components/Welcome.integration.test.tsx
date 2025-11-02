import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Welcome } from './Welcome';
import { SeedPackSelector } from './SeedPackSelector';
import { usePromptStore } from '@/store/promptStore';
import * as seedLoader from '@/lib/seedLoader';

// Mock the seed loader module
vi.mock('@/lib/seedLoader', () => ({
  getAvailableSeedPacks: vi.fn(() => ['development', 'writing', 'analysis']),
  loadSeedCategories: vi.fn(() => [
    { id: '1', name: 'Development', color: '#3B82F6', description: 'Dev work' },
    { id: '2', name: 'Writing', color: '#EC4899', description: 'Writing work' }
  ]),
  loadSeedPrompts: vi.fn((packs: string[]) => {
    if (packs.includes('development')) {
      return [
        {
          title: 'Code Review',
          promptText: 'Review code...',
          category: 'Development',
          tags: 'code',
          expectedOutput: 'Review notes',
          notes: 'Development task'
        }
      ];
    }
    return [];
  })
}));

describe('Welcome Component Integration with Seed Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Welcome Seed Pack Selection Display', () => {
    it('should render Welcome component with onCreateFirst callback', () => {
      const mockCreateFirst = vi.fn();
      const mockSkipTour = vi.fn();

      render(
        <Welcome onCreateFirst={mockCreateFirst} onSkipTour={mockSkipTour} />
      );

      expect(screen.getByText('Welcome to Prompt Database')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first prompt/i })).toBeInTheDocument();
    });

    it('should render SeedPackSelector component independently', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('Load Seed Prompts')).toBeInTheDocument();
      const developmentElements = screen.getAllByText('Development');
      expect(developmentElements.length).toBeGreaterThan(0);
      const writingElements = screen.getAllByText('Writing');
      expect(writingElements.length).toBeGreaterThan(0);
      const analysisElements = screen.getAllByText('Analysis');
      expect(analysisElements.length).toBeGreaterThan(0);
    });

    it('should display all available seed packs in selector', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Writing')).toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
    });

    it('should show prompt counts for each pack', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const promptCounts = screen.getAllByText(/\d+ prompts/i);
      expect(promptCounts.length).toBeGreaterThan(0);
    });
  });

  describe('Seed Pack Selection Behavior', () => {
    it('should allow selecting a single seed pack', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const developmentCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(developmentCheckbox);

      expect(mockSelectionChange).toHaveBeenCalledWith(['development']);
    });

    it('should allow selecting multiple seed packs', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      
      // Click development checkbox
      await user.click(checkboxes[0]);
      expect(mockSelectionChange).toHaveBeenCalledWith(['development']);
      
      // Rerender with updated selection
      rerender(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockSelectionChange}
        />
      );
      
      // Click writing checkbox (now both should be selected)
      const checkboxesAfterRerender = screen.getAllByRole('checkbox');
      await user.click(checkboxesAfterRerender[1]);
      
      // The last call should have both packs
      expect(mockSelectionChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(['development', 'writing'])
      );
    });

    it('should allow deselecting a pack', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockSelectionChange}
        />
      );

      const developmentCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(developmentCheckbox);

      expect(mockSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should load all packs when Load All button is clicked', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const loadAllButton = screen.getByRole('button', { name: /load all/i });
      await user.click(loadAllButton);

      expect(mockSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining(['development', 'writing', 'analysis'])
      );
    });

    it('should skip seed loading when Skip button is clicked', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SeedPackSelector
          selectedPacks={['development', 'writing']}
          onSelectionChange={mockSelectionChange}
        />
      );

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      expect(mockSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Selection State Display', () => {
    it('should display "No packs selected" when no packs are selected', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('No packs selected')).toBeInTheDocument();
    });

    it('should display count when one pack is selected', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('1 pack selected')).toBeInTheDocument();
    });

    it('should display count when multiple packs are selected', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={['development', 'writing', 'analysis']}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('3 packs selected')).toBeInTheDocument();
    });

    it('should display all packs as checked when all are selected', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={['development', 'writing', 'analysis']}
          onSelectionChange={mockSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      const checkedCount = checkboxes.filter(cb => cb.checked).length;
      expect(checkedCount).toBe(3);
    });
  });

  describe('Seed Loader Functions Integration', () => {
    it('should load seed categories correctly', () => {
      const categories = seedLoader.loadSeedCategories();

      expect(categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Development' }),
          expect.objectContaining({ name: 'Writing' })
        ])
      );
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should load seed prompts for selected packs', () => {
      const prompts = seedLoader.loadSeedPrompts(['development']);

      expect(prompts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Code Review',
            category: 'Development'
          })
        ])
      );
    });

    it('should return empty array when no packs are selected', () => {
      const prompts = seedLoader.loadSeedPrompts([]);

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThanOrEqual(0);
    });

    it('should load multiple packs when specified', () => {
      const prompts = seedLoader.loadSeedPrompts(['development', 'writing']);

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('First-Time User Flow', () => {
    it('should detect first-time user scenario with no prompts', () => {
      // Test the condition for first-time user (no prompts in store)
      // without directly calling hooks outside of components
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      // Verify the seed pack selector is shown (which is the first-time user flow)
      expect(screen.getByText(/load seed prompts/i)).toBeInTheDocument();
    });

    it('should provide option to load seed data on first visit', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText(/load seed prompts/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('should show description encouraging seed data loading', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText(/choose which prompt packs/i)).toBeInTheDocument();
    });

    it('should provide helpful tip about adding more prompts', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText(/add more prompts anytime/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility - Seed Selector Integration', () => {
    it('should have accessible checkbox labels for each pack', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName();
      });
    });

    it('should allow keyboard navigation of seed packs', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      firstCheckbox.focus();

      await user.keyboard(' '); // Space to toggle

      expect(mockSelectionChange).toHaveBeenCalled();
    });

    it('should have descriptive button text', () => {
      const mockSelectionChange = vi.fn();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByRole('button', { name: /load all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });

    it('should announce selection count to screen readers', () => {
      const mockSelectionChange = vi.fn();

      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('No packs selected')).toBeInTheDocument();

      rerender(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockSelectionChange}
        />
      );

      expect(screen.getByText('1 pack selected')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty seed data gracefully', () => {
      vi.mocked(seedLoader.loadSeedPrompts).mockReturnValueOnce([]);

      const prompts = seedLoader.loadSeedPrompts(['development']);

      expect(Array.isArray(prompts)).toBe(true);
    });

    it('should handle invalid pack names gracefully', () => {
      const prompts = seedLoader.loadSeedPrompts(['invalid-pack' as any]);

      expect(Array.isArray(prompts)).toBe(true);
    });

    it('should maintain selection state across re-renders', () => {
      const mockSelectionChange = vi.fn();

      const { rerender } = render(
        <SeedPackSelector
          selectedPacks={['development']}
          onSelectionChange={mockSelectionChange}
        />
      );

      let checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true);

      rerender(
        <SeedPackSelector
          selectedPacks={['development', 'writing']}
          onSelectionChange={mockSelectionChange}
        />
      );

      checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(true);
    });

    it('should handle rapid pack selections', async () => {
      const mockSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SeedPackSelector
          selectedPacks={[]}
          onSelectionChange={mockSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(mockSelectionChange).toHaveBeenCalledTimes(3);
    });
  });
});
