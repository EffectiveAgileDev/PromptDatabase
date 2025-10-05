import { usePromptStore } from '@/store/promptStore';

export function TestApp() {
  const { prompts, addPrompt } = usePromptStore();
  
  const handleAddTest = () => {
    addPrompt({
      title: 'Test Prompt ' + Date.now(),
      promptText: 'This is a test prompt'
    });
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prompt Database Test</h1>
      <button 
        onClick={handleAddTest}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        Add Test Prompt
      </button>
      <div className="space-y-2">
        <p>Total Prompts: {prompts.length}</p>
        {prompts.map(prompt => (
          <div key={prompt.id} className="p-2 border rounded">
            {prompt.title}
          </div>
        ))}
      </div>
    </div>
  );
}