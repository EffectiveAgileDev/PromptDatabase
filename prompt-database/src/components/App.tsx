import { useEffect } from 'react';
import { useAppStore } from '@/store/promptStore';
import { promptModel } from '@/lib/promptModel';
import { PromptForm } from './PromptForm';
import { PromptList } from './PromptList';

export function App() {
  const {
    prompts,
    ui,
    setPrompts,
    setIsLoading,
    setError,
    setIsCreating,
    selectPrompt,
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
      
      // Auto-select first prompt if available and none selected
      if (allPrompts.length > 0 && !prompts.selectedId) {
        selectPrompt(allPrompts[0].id);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    selectPrompt(null);
  };

  const selectedPrompt = prompts.selectedId 
    ? prompts.items.get(prompts.selectedId)
    : undefined;

  const showForm = ui.isCreating || selectedPrompt;

  if (ui.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading prompts...</div>
      </div>
    );
  }

  if (ui.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {ui.error}</div>
          <button
            onClick={loadPrompts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Prompt Database</h1>
          <button
            data-testid="create-prompt-button"
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Prompt
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar with prompt list */}
        <div className="w-1/2 border-r border-gray-200 overflow-hidden">
          <div className="p-6 h-full overflow-y-auto">
            <PromptList />
          </div>
        </div>

        {/* Main content area */}
        <div className="w-1/2 overflow-hidden">
          <div className="p-6 h-full overflow-y-auto">
            {showForm ? (
              <PromptForm 
                key={ui.isCreating ? 'new' : selectedPrompt?.id}
                prompt={ui.isCreating ? undefined : selectedPrompt}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a prompt to view details</p>
                  <p className="text-sm">or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}