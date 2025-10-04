import { useEffect } from 'react';
import { useAppStore } from '@/store/promptStore';
import { promptModel } from '@/lib/promptModel';

export function usePrompts() {
  const {
    setPrompts,
    setIsLoading,
    setError,
  } = useAppStore();

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allPrompts = await promptModel.getAllPrompts();
      setPrompts(allPrompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const createPrompt = async (promptData: {
    title: string;
    promptText?: string;
    category?: string;
    tags?: string;
    expectedOutput?: string;
    notes?: string;
  }) => {
    try {
      setError(null);
      const newPrompt = await promptModel.createPrompt(promptData);
      
      // Update store
      const { addPrompt } = useAppStore.getState();
      addPrompt(newPrompt);
      
      return newPrompt;
    } catch (error) {
      console.error('Failed to create prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to create prompt');
      throw error;
    }
  };

  const updatePrompt = async (id: string, updates: any) => {
    try {
      setError(null);
      const updatedPrompt = await promptModel.updatePrompt(id, updates);
      
      // Update store
      const { updatePrompt: updateInStore } = useAppStore.getState();
      updateInStore(id, updatedPrompt);
      
      return updatedPrompt;
    } catch (error) {
      console.error('Failed to update prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to update prompt');
      throw error;
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      setError(null);
      await promptModel.deletePrompt(id);
      
      // Update store
      const { deletePrompt: deleteFromStore } = useAppStore.getState();
      deleteFromStore(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete prompt');
      throw error;
    }
  };

  const { prompts, ui } = useAppStore();

  return {
    prompts: prompts.items,
    isLoading: ui.isLoading,
    error: ui.error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    loadPrompts,
  };
}