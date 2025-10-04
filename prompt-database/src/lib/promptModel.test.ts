import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

// Mock the storage service
vi.mock('@/lib/storage', () => ({
  storageService: {
    getAllPrompts: vi.fn(),
    getPrompt: vi.fn(),
    addPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    searchPrompts: vi.fn(),
  },
}));

import { PromptModel } from './promptModel';
import { storageService } from '@/lib/storage';

describe('PromptModel', () => {
  let promptModel: PromptModel;

  beforeEach(() => {
    vi.clearAllMocks();
    promptModel = new PromptModel();
  });

  const mockStorageService = storageService as any;

  describe('createPrompt', () => {
    it('creates a new prompt with required fields', async () => {
      const promptData = {
        title: 'Test Prompt',
        promptText: 'Test content',
      };

      mockStorageService.getAllPrompts.mockResolvedValue([]);
      mockStorageService.addPrompt.mockResolvedValue(undefined);

      const result = await promptModel.createPrompt(promptData);

      expect(result).toMatchObject({
        id: expect.any(String),
        title: 'Test Prompt',
        promptText: 'Test content',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockStorageService.addPrompt).toHaveBeenCalledWith(result);
    });

    it('validates required title field', async () => {
      const promptData = {
        promptText: 'Test content',
      };

      await expect(promptModel.createPrompt(promptData as any)).rejects.toThrow(
        'Title is required'
      );
    });

    it('ensures title uniqueness', async () => {
      const existingPrompts = [
        { id: '1', title: 'Existing Title', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      mockStorageService.getAllPrompts.mockResolvedValue(existingPrompts);

      const promptData = {
        title: 'Existing Title',
        promptText: 'Test content',
      };

      await expect(promptModel.createPrompt(promptData)).rejects.toThrow(
        'Title must be unique'
      );
    });
  });

  describe('updatePrompt', () => {
    it('updates an existing prompt', async () => {
      const existingPrompt: Prompt = {
        id: 'test-id',
        title: 'Original Title',
        promptText: 'Original content',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const updates = {
        title: 'Updated Title',
        promptText: 'Updated content',
      };

      mockStorageService.getPrompt.mockResolvedValue(existingPrompt);
      mockStorageService.updatePrompt.mockResolvedValue(undefined);

      const result = await promptModel.updatePrompt('test-id', updates);

      expect(result).toMatchObject({
        id: 'test-id',
        title: 'Updated Title',
        promptText: 'Updated content',
        createdAt: existingPrompt.createdAt,
        updatedAt: expect.any(Date),
      });

      expect(mockStorageService.updatePrompt).toHaveBeenCalledWith('test-id', expect.objectContaining(updates));
    });

    it('throws error when prompt not found', async () => {
      mockStorageService.getPrompt.mockResolvedValue(undefined);

      await expect(promptModel.updatePrompt('non-existent', {})).rejects.toThrow(
        'Prompt not found'
      );
    });

    it('validates title uniqueness on update', async () => {
      const existingPrompt: Prompt = {
        id: 'test-id',
        title: 'Original Title',
        promptText: 'Original content',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const otherPrompts = [
        { id: 'other-id', title: 'Other Title', createdAt: new Date(), updatedAt: new Date() }
      ];

      mockStorageService.getPrompt.mockResolvedValue(existingPrompt);
      mockStorageService.getAllPrompts.mockResolvedValue([existingPrompt, ...otherPrompts]);

      const updates = { title: 'Other Title' };

      await expect(promptModel.updatePrompt('test-id', updates)).rejects.toThrow(
        'Title must be unique'
      );
    });
  });

  describe('deletePrompt', () => {
    it('deletes an existing prompt', async () => {
      mockStorageService.getPrompt.mockResolvedValue({
        id: 'test-id',
        title: 'Test Prompt',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockStorageService.deletePrompt.mockResolvedValue(undefined);

      await promptModel.deletePrompt('test-id');

      expect(mockStorageService.deletePrompt).toHaveBeenCalledWith('test-id');
    });

    it('throws error when trying to delete non-existent prompt', async () => {
      mockStorageService.getPrompt.mockResolvedValue(undefined);

      await expect(promptModel.deletePrompt('non-existent')).rejects.toThrow(
        'Prompt not found'
      );
    });
  });

  describe('getPrompt', () => {
    it('retrieves a prompt by id', async () => {
      const prompt = {
        id: 'test-id',
        title: 'Test Prompt',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorageService.getPrompt.mockResolvedValue(prompt);

      const result = await promptModel.getPrompt('test-id');

      expect(result).toEqual(prompt);
      expect(mockStorageService.getPrompt).toHaveBeenCalledWith('test-id');
    });

    it('returns null for non-existent prompt', async () => {
      mockStorageService.getPrompt.mockResolvedValue(undefined);

      const result = await promptModel.getPrompt('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllPrompts', () => {
    it('retrieves all prompts', async () => {
      const prompts = [
        { id: '1', title: 'Prompt 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Prompt 2', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockStorageService.getAllPrompts.mockResolvedValue(prompts);

      const result = await promptModel.getAllPrompts();

      expect(result).toEqual(prompts);
      expect(mockStorageService.getAllPrompts).toHaveBeenCalled();
    });
  });

  describe('searchPrompts', () => {
    it('searches prompts by field', async () => {
      const searchResults = [
        { id: '1', title: 'Matching Prompt', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockStorageService.searchPrompts.mockResolvedValue(searchResults);

      const result = await promptModel.searchPrompts('Matching', 'title');

      expect(result).toEqual(searchResults);
      expect(mockStorageService.searchPrompts).toHaveBeenCalledWith('Matching', 'title');
    });
  });
});