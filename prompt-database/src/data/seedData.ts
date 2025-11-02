/**
 * Seed Data Module
 * 
 * Provides pre-populated categories and prompt templates for new users.
 * Organized by domain/purpose for selective loading.
 */

export { seedCategories } from './categories';
export { developmentPrompts } from './development';
export { writingPrompts } from './writing';
export { analysisPrompts } from './analysis';

// Export all available seed packs for easy iteration
export const seedPacks = {
  development: () => import('./development').then(m => m.developmentPrompts),
  writing: () => import('./writing').then(m => m.writingPrompts),
  analysis: () => import('./analysis').then(m => m.analysisPrompts),
} as const;
