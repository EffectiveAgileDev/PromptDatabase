import { describe, it, expect } from 'vitest';
import { seedCategories, developmentPrompts, writingPrompts, analysisPrompts } from './seedData';
import { loadSeedCategories, loadSeedPrompts } from '@/lib/seedLoader';

describe('Seed Data Structure', () => {
  describe('RED Phase - Seed Data Exports', () => {
    it('should export seedCategories array', () => {
      expect(seedCategories).toBeDefined();
      expect(Array.isArray(seedCategories)).toBe(true);
    });

    it('should export development prompts', () => {
      expect(developmentPrompts).toBeDefined();
      expect(Array.isArray(developmentPrompts)).toBe(true);
    });

    it('should export writing prompts', () => {
      expect(writingPrompts).toBeDefined();
      expect(Array.isArray(writingPrompts)).toBe(true);
    });

    it('should export analysis prompts', () => {
      expect(analysisPrompts).toBeDefined();
      expect(Array.isArray(analysisPrompts)).toBe(true);
    });

    it('should have categories with required fields', () => {
      expect(seedCategories.length).toBeGreaterThan(0);
      seedCategories.forEach((category) => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('color');
        expect(typeof category.name).toBe('string');
        expect(typeof category.color).toBe('string');
      });
    });

    it('should have development prompts with required fields', () => {
      expect(developmentPrompts.length).toBeGreaterThan(0);
      developmentPrompts.forEach((prompt) => {
        expect(prompt).toHaveProperty('title');
        expect(prompt).toHaveProperty('promptText');
        expect(prompt).toHaveProperty('category');
        expect(typeof prompt.title).toBe('string');
        expect(typeof prompt.promptText).toBe('string');
        expect(typeof prompt.category).toBe('string');
      });
    });
  });

  describe('RED Phase - Seed Loader Functions', () => {
    it('should provide loadSeedCategories function', () => {
      expect(loadSeedCategories).toBeDefined();
      expect(typeof loadSeedCategories).toBe('function');
    });

    it('should provide loadSeedPrompts function', () => {
      expect(loadSeedPrompts).toBeDefined();
      expect(typeof loadSeedPrompts).toBe('function');
    });

    it('loadSeedCategories should return categories array', () => {
      const categories = loadSeedCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('loadSeedPrompts should accept pack names', () => {
      const prompts = loadSeedPrompts(['development']);
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('loadSeedPrompts should combine multiple packs', () => {
      const prompts = loadSeedPrompts(['development', 'writing']);
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(1);
    });

    it('loadSeedPrompts should return empty array for unknown pack', () => {
      const prompts = loadSeedPrompts(['nonexistent']);
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBe(0);
    });
  });

  describe('RED Phase - Seed Data Validation', () => {
    it('all prompts should have matching categories', () => {
      const allPrompts = [...developmentPrompts, ...writingPrompts, ...analysisPrompts];
      const categoryNames = seedCategories.map(c => c.name);

      allPrompts.forEach((prompt) => {
        expect(categoryNames).toContain(prompt.category);
      });
    });

    it('should not have duplicate category names', () => {
      const names = seedCategories.map(c => c.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('each prompt should have unique title within its pack', () => {
      const devTitles = developmentPrompts.map(p => p.title);
      const uniqueDevTitles = new Set(devTitles);
      expect(devTitles.length).toBe(uniqueDevTitles.size);
    });
  });
});
