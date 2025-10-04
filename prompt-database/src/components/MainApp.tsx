import { useState, useMemo } from 'react';

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

type SortField = 'title' | 'category' | 'createdAt' | 'updatedAt';
type SearchField = 'title' | 'promptText' | 'category' | 'tags' | 'all';

export function MainApp() {
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: '1',
      title: 'Sample Prompt',
      promptText: 'This is a sample prompt text',
      category: 'General',
      tags: 'sample, demo',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'API Documentation Generator',
      promptText: 'Generate comprehensive API documentation from code',
      category: 'Development',
      tags: 'api, documentation, code',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-03'),
    },
    {
      id: '3',
      title: 'User Story Writer',
      promptText: 'Create detailed user stories for agile development',
      category: 'Project Management',
      tags: 'agile, scrum, planning',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
    }
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    category: '',
    tags: '',
    expectedOutput: '',
    notes: '',
  });

  // Search and filter logic
  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;
    
    const query = searchQuery.toLowerCase();
    return prompts.filter(prompt => {
      if (searchField === 'all') {
        return (
          prompt.title?.toLowerCase().includes(query) ||
          prompt.promptText?.toLowerCase().includes(query) ||
          prompt.category?.toLowerCase().includes(query) ||
          prompt.tags?.toLowerCase().includes(query) ||
          prompt.expectedOutput?.toLowerCase().includes(query) ||
          prompt.notes?.toLowerCase().includes(query)
        );
      }
      const fieldValue = prompt[searchField as keyof Prompt];
      return fieldValue?.toString().toLowerCase().includes(query);
    });
  }, [prompts, searchQuery, searchField]);

  // Sort logic
  const sortedPrompts = useMemo(() => {
    const sorted = [...filteredPrompts].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPrompts, sortField, sortDirection]);

  // Pagination logic
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedPrompts.slice(start, end);
  }, [sortedPrompts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      title: prompt.title,
      promptText: prompt.promptText || '',
      category: prompt.category || '',
      tags: prompt.tags || '',
      expectedOutput: prompt.expectedOutput || '',
      notes: prompt.notes || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    if (selectedPrompt) {
      // Update existing prompt
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id 
          ? { ...p, ...formData, updatedAt: new Date() }
          : p
      ));
      setSelectedPrompt(null);
    } else {
      // Create new prompt
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPrompts([...prompts, newPrompt]);
    }
    
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
            {/* Search Controls */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search prompts..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as SearchField)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title</option>
                  <option value="promptText">Prompt Text</option>
                  <option value="category">Category</option>
                  <option value="tags">Tags</option>
                </select>
              </div>
              
              {/* Sort Controls */}
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="title">Title</option>
                  <option value="category">Category</option>
                  <option value="createdAt">Created</option>
                  <option value="updatedAt">Updated</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-3">
              Prompts ({sortedPrompts.length} / {prompts.length})
            </h2>
            
            <div className="space-y-2">
              {paginatedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    selectedPrompt?.id === prompt.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      onClick={() => handleEdit(prompt)}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {prompt.category || 'No category'}
                      </p>
                      {prompt.tags && (
                        <p className="text-xs text-gray-400 mt-1">
                          Tags: {prompt.tags}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(prompt.id);
                      }}
                      className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
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