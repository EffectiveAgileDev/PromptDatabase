import { useState } from 'react';

interface Prompt {
  id: string;
  title: string;
  promptText?: string;
  category?: string;
  tags?: string;
  expectedOutput?: string;
  lastUsed?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function MainApp() {
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: '1',
      title: 'Sample Prompt',
      promptText: 'This is a sample prompt text',
      category: 'General',
      tags: 'sample, demo',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    category: '',
    tags: '',
    expectedOutput: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPrompts([...prompts, newPrompt]);
    setFormData({
      title: '',
      promptText: '',
      category: '',
      tags: '',
      expectedOutput: '',
      notes: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Prompt Database</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Prompt List */}
        <div className="w-1/3 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">Prompts ({prompts.length})</h2>
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPrompt?.id === prompt.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {prompt.category || 'No category'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Text
              </label>
              <textarea
                value={formData.promptText}
                onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Output
              </label>
              <textarea
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedPrompt ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}