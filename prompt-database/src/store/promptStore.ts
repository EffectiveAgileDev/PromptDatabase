import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CustomField } from '@/types/customFields';

export interface Prompt {
  id: string;
  title: string;
  promptText?: string;
  category?: string;
  tags?: string;
  expectedOutput?: string;
  lastUsed?: Date;
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface PromptStore {
  // Prompts
  prompts: Prompt[];
  selectedPromptId: string | null;
  
  // Custom Fields
  customFields: CustomField[];
  
  // Actions for prompts
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  selectPrompt: (id: string | null) => void;
  getSelectedPrompt: () => Prompt | undefined;
  
  // Actions for custom fields
  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  removeCustomField: (fieldId: string) => void;
  updateCustomField: (fieldId: string, updates: Partial<CustomField>) => void;
  
  // Update lastUsed timestamp
  updateLastUsed: (id: string) => void;
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: [],
      selectedPromptId: null,
      customFields: [],
      
      // Prompt actions
      addPrompt: (promptData) => {
        const newPrompt: Prompt = {
          ...promptData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          prompts: [...state.prompts, newPrompt],
          selectedPromptId: newPrompt.id,
        }));
      },
      
      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) =>
            prompt.id === id
              ? { ...prompt, ...updates, updatedAt: new Date() }
              : prompt
          ),
        }));
      },
      
      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((prompt) => prompt.id !== id),
          selectedPromptId: state.selectedPromptId === id ? null : state.selectedPromptId,
        }));
      },
      
      selectPrompt: (id) => {
        set({ selectedPromptId: id });
      },
      
      getSelectedPrompt: () => {
        const state = get();
        return state.prompts.find((p) => p.id === state.selectedPromptId);
      },
      
      // Custom field actions
      addCustomField: (fieldData) => {
        const newField: CustomField = {
          ...fieldData,
          id: uuidv4(),
        };
        
        set((state) => ({
          customFields: [...state.customFields, newField],
        }));
      },
      
      removeCustomField: (fieldId) => {
        set((state) => ({
          customFields: state.customFields.filter((field) => field.id !== fieldId),
        }));
      },
      
      updateCustomField: (fieldId, updates) => {
        set((state) => ({
          customFields: state.customFields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          ),
        }));
      },
      
      updateLastUsed: (id) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) =>
            prompt.id === id
              ? { ...prompt, lastUsed: new Date(), updatedAt: new Date() }
              : prompt
          ),
        }));
      },
    }),
    {
      name: 'prompt-storage', // Name for localStorage key
      partialize: (state) => ({
        prompts: state.prompts,
        customFields: state.customFields,
      }),
    }
  )
);