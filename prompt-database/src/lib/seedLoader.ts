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

/**
 * Filter out prompts that already exist in the store
 * 
 * Checks for duplicates by comparing title and promptText (case-insensitive)
 * 
 * @param seedPrompts - Prompts to filter
 * @param existingPrompts - Existing prompts from the store
 * @returns Prompts that don't already exist
 */
export function filterExistingPrompts(
  seedPrompts: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[],
  existingPrompts: Prompt[]
): Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[] {
  return seedPrompts.filter(seedPrompt => {
    const normalizedSeedTitle = seedPrompt.title?.toLowerCase().trim() || '';
    const normalizedSeedText = seedPrompt.promptText?.toLowerCase().trim() || '';
    
    return !existingPrompts.some(existing => {
      const normalizedExistingTitle = existing.title?.toLowerCase().trim() || '';
      const normalizedExistingText = existing.promptText?.toLowerCase().trim() || '';
      
      // Match if title and promptText are the same
      return normalizedSeedTitle === normalizedExistingTitle && 
             normalizedSeedText === normalizedExistingText;
    });
  });
}

/**
 * Filter out categories that already exist in the store
 * 
 * Checks for duplicates by comparing category name (case-insensitive)
 * 
 * @param seedCategories - Categories to filter
 * @param existingCategories - Existing categories from the store
 * @returns Categories that don't already exist
 */
export function filterExistingCategories(
  seedCategories: Omit<Category, 'id'>[],
  existingCategories: Category[]
): Omit<Category, 'id'>[] {
  return seedCategories.filter(seedCategory => {
    const normalizedSeedName = seedCategory.name?.toLowerCase().trim() || '';
    
    return !existingCategories.some(existing => {
      const normalizedExistingName = existing.name?.toLowerCase().trim() || '';
      return normalizedSeedName === normalizedExistingName;
    });
  });
}
