import { db } from './database';
import { Prompt, Category } from '@/types/prompt';

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

  // Search operations
  async searchPrompts(query: string, field: keyof Prompt = 'title'): Promise<Prompt[]> {
    try {
      const allPrompts = await db.prompts.toArray();
      return allPrompts.filter(prompt => {
        const value = prompt[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    } catch (error) {
      console.error('Failed to search prompts:', error);
      const prompts = this.fallbackToLocalStorage('prompts', []);
      return prompts.filter((prompt: Prompt) => {
        const value = prompt[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
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