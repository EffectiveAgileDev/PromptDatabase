import Dexie, { type Table } from 'dexie';
import type { Prompt, Category } from '@/types';

export class PromptDatabase extends Dexie {
  prompts!: Table<Prompt>;
  categories!: Table<Category>;

  constructor() {
    super('PromptDatabase');
    
    this.version(1).stores({
      prompts: 'id, title, category, lastUsed, createdAt, updatedAt, tags',
      categories: 'id, name',
    });
  }
}

export const db = new PromptDatabase();