import { db } from './database';
import type { Prompt, Category } from '@/types';

export type SearchField = 'title' | 'promptText' | 'category' | 'tags';
export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'lastUsed' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface SearchOptions {
  query?: string;
  field?: SearchField;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  limit?: number;
  offset?: number;
}

export class StorageService {
  // Prompt CRUD operations
  async getAllPrompts(): Promise<Prompt[]> {
    try {
      return await db.prompts.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      return this.fallbackToLocalStorage('prompts', []);
    }
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    try {
      return await db.prompts.get(id);
    } catch (error) {
      console.error('Failed to fetch prompt:', error);
      const prompts = this.fallbackToLocalStorage('prompts', []);
      return prompts.find((p: Prompt) => p.id === id);
    }
  }

  async addPrompt(prompt: Prompt): Promise<void> {
    try {
      await db.prompts.add(prompt);
    } catch (error) {
      console.error('Failed to add prompt:', error);
      this.fallbackAddToLocalStorage('prompts', prompt);
    }
  }

  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
    try {
      await db.prompts.update(id, { ...updates, updatedAt: new Date() });
    } catch (error) {
      console.error('Failed to update prompt:', error);
      this.fallbackUpdateLocalStorage('prompts', id, updates);
    }
  }

  async deletePrompt(id: string): Promise<void> {
    try {
      await db.prompts.delete(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      this.fallbackDeleteFromLocalStorage('prompts', id);
    }
  }

  // Search and sort operations
  async searchPrompts(options: SearchOptions = {}): Promise<Prompt[]> {
    try {
      let prompts = await db.prompts.toArray();
      
      // Apply search filter
      if (options.query && options.field) {
        prompts = this.filterPrompts(prompts, options.query, options.field);
      }
      
      // Apply sorting
      if (options.sortBy) {
        prompts = this.sortPrompts(prompts, options.sortBy, options.sortDirection || 'asc');
      }
      
      // Apply pagination
      if (options.limit !== undefined) {
        const start = options.offset || 0;
        prompts = prompts.slice(start, start + options.limit);
      }
      
      return prompts;
    } catch (error) {
      console.error('Failed to search prompts:', error);
      return this.fallbackSearch(options);
    }
  }

  private filterPrompts(prompts: Prompt[], query: string, field: SearchField): Prompt[] {
    const lowerQuery = query.toLowerCase();
    
    return prompts.filter(prompt => {
      switch (field) {
        case 'title':
          return prompt.title?.toLowerCase().includes(lowerQuery) || false;
        case 'promptText':
          return prompt.promptText?.toLowerCase().includes(lowerQuery) || false;
        case 'category':
          return prompt.category?.toLowerCase().includes(lowerQuery) || false;
        case 'tags':
          return prompt.tags?.toLowerCase().includes(lowerQuery) || false;
        default:
          return false;
      }
    });
  }

  private sortPrompts(prompts: Prompt[], field: SortField, direction: SortDirection): Prompt[] {
    return [...prompts].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (field) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'lastUsed':
          aValue = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
          bValue = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          return 0;
      }
      
      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  private fallbackSearch(options: SearchOptions): Prompt[] {
    try {
      let prompts = this.fallbackToLocalStorage('prompts', []);
      
      if (options.query && options.field) {
        prompts = this.filterPrompts(prompts, options.query, options.field);
      }
      
      if (options.sortBy) {
        prompts = this.sortPrompts(prompts, options.sortBy, options.sortDirection || 'asc');
      }
      
      if (options.limit !== undefined) {
        const start = options.offset || 0;
        prompts = prompts.slice(start, start + options.limit);
      }
      
      return prompts;
    } catch (error) {
      console.error('Fallback search failed:', error);
      return [];
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.categories.toArray();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return this.fallbackToLocalStorage('categories', []);
    }
  }

  async addCategory(category: Category): Promise<void> {
    try {
      await db.categories.add(category);
    } catch (error) {
      console.error('Failed to add category:', error);
      this.fallbackAddToLocalStorage('categories', category);
    }
  }

  // Storage quota monitoring
  async getStorageInfo(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return { usage: 0, quota: 0 };
  }

  // LocalStorage fallback methods
  private fallbackToLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`promptdb_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('LocalStorage fallback failed:', error);
      return defaultValue;
    }
  }

  private fallbackAddToLocalStorage<T>(key: string, item: T): void {
    try {
      const existing = this.fallbackToLocalStorage(key, []);
      const updated = Array.isArray(existing) ? [...existing, item] : [item];
      localStorage.setItem(`promptdb_${key}`, JSON.stringify(updated));
    } catch (error) {
      console.error('LocalStorage add fallback failed:', error);
    }
  }

  private fallbackUpdateLocalStorage<T extends { id: string }>(
    key: string, 
    id: string, 
    updates: Partial<T>
  ): void {
    try {
      const existing = this.fallbackToLocalStorage(key, []);
      if (Array.isArray(existing)) {
        const index = existing.findIndex((item: T) => item.id === id);
        if (index !== -1) {
          existing[index] = { ...existing[index], ...updates, updatedAt: new Date() };
          localStorage.setItem(`promptdb_${key}`, JSON.stringify(existing));
        }
      }
    } catch (error) {
      console.error('LocalStorage update fallback failed:', error);
    }
  }

  private fallbackDeleteFromLocalStorage<T extends { id: string }>(key: string, id: string): void {
    try {
      const existing = this.fallbackToLocalStorage(key, []);
      if (Array.isArray(existing)) {
        const filtered = existing.filter((item: T) => item.id !== id);
        localStorage.setItem(`promptdb_${key}`, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('LocalStorage delete fallback failed:', error);
    }
  }
}

export const storageService = new StorageService();