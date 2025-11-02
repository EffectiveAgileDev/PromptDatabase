/**
 * Seed Data Loader
 * 
 * Utilities for loading seed categories and prompts by pack name.
 * Used for first-time user setup and optional seed data loading.
 */

import {
  seedCategories,
  developmentPrompts,
  writingPrompts,
  analysisPrompts
} from '@/data/seedData';
import type { Prompt, Category } from '@/store/promptStore';

type SeedPackName = 'development' | 'writing' | 'analysis';

/**
 * Load all seed categories
 * 
 * Returns the complete list of predefined categories
 * suitable for first-time app setup.
 */
export function loadSeedCategories(): Category[] {
  // Return categories as Category type (without id field)
  return seedCategories.map(cat => ({
    name: cat.name,
    color: cat.color,
    description: cat.description
  }));
}

/**
 * Load seed prompts by pack name(s)
 * 
 * @param packNames - Array of seed pack names to load
 * @returns Combined array of prompts from specified packs
 */
export function loadSeedPrompts(
  packNames: SeedPackName[] = []
): Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[] {
  const prompts: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  const packMap = {
    development: developmentPrompts,
    writing: writingPrompts,
    analysis: analysisPrompts,
  };

  for (const packName of packNames) {
    if (packName in packMap) {
      const pack = packMap[packName];
      prompts.push(...pack);
    }
  }

  return prompts;
}

/**
 * Get available seed pack names
 */
export function getAvailableSeedPacks(): SeedPackName[] {
  return ['development', 'writing', 'analysis'];
}

/**
 * Load all seed data (categories + all prompts)
 */
export function loadAllSeedData() {
  const categories = loadSeedCategories();
  const prompts = loadSeedPrompts(['development', 'writing', 'analysis']);

  return { categories, prompts };
}
