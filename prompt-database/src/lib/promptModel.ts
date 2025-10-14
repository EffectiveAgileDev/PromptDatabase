import { v4 as uuidv4 } from 'uuid';
import type { Prompt } from '@/store/promptStore';
import { storageService } from './storage';

export interface CreatePromptData {
  title: string;
  promptText?: string;
  category?: string;
  tags?: string;
  expectedOutput?: string;
  notes?: string;
}

export interface UpdatePromptData {
  title?: string;
  promptText?: string;
  category?: string;
  tags?: string;
  expectedOutput?: string;
  notes?: string;
}

export class PromptModel {
  async createPrompt(data: CreatePromptData): Promise<Prompt> {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }

    // Check title uniqueness
    const existingPrompts = await storageService.getAllPrompts();
    const titleExists = existingPrompts.some(
      p => p.title.toLowerCase() === data.title.trim().toLowerCase()
    );

    if (titleExists) {
      throw new Error('Title must be unique');
    }

    // Create new prompt
    const newPrompt: Prompt = {
      id: uuidv4(),
      title: data.title.trim(),
      promptText: data.promptText || '',
      category: data.category || '',
      tags: data.tags || '',
      expectedOutput: data.expectedOutput || '',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storageService.addPrompt(newPrompt);
    return newPrompt;
  }

  async updatePrompt(id: string, data: UpdatePromptData): Promise<Prompt> {
    // Check if prompt exists
    const existingPrompt = await storageService.getPrompt(id);
    if (!existingPrompt) {
      throw new Error('Prompt not found');
    }

    // If title is being updated, check uniqueness
    if (data.title && data.title.trim()) {
      const allPrompts = await storageService.getAllPrompts();
      const titleExists = allPrompts.some(
        p => p.title.toLowerCase() === data.title.trim().toLowerCase() && p.id !== id
      );

      if (titleExists) {
        throw new Error('Title must be unique');
      }
    }

    // Prepare updated prompt
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      ...data,
      title: data.title ? data.title.trim() : existingPrompt.title,
      updatedAt: new Date(),
    };

    await storageService.updatePrompt(id, updatedPrompt);
    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<void> {
    // Check if prompt exists
    const existingPrompt = await storageService.getPrompt(id);
    if (!existingPrompt) {
      throw new Error('Prompt not found');
    }

    await storageService.deletePrompt(id);
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return await storageService.getPrompt(id);
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return await storageService.getAllPrompts();
  }

  async searchPrompts(query: string, field: keyof Prompt = 'title'): Promise<Prompt[]> {
    return await storageService.searchPrompts({ query, field: field as any });
  }
}

// Export singleton instance
export const promptModel = new PromptModel();