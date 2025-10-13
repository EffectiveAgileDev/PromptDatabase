import { useState, useMemo, useCallback } from 'react';
import { CopyToClipboard } from './CopyToClipboard';
import { ToastProvider, useToast } from '@/hooks/useToast';

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

function EnhancedMainAppInner() {
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: '1',
      title: 'Code Review Assistant',
      promptText: 'Analyze this code for potential bugs, performance issues, and best practices',
      category: 'Development',
      tags: 'code, review, quality',
      expectedOutput: 'Detailed code analysis with specific suggestions',
      notes: 'Works best with code snippets under 200 lines',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'API Documentation Generator',
      promptText: 'Generate comprehensive API documentation from code',
      category: 'Documentation',
      tags: 'api, documentation, code',
      expectedOutput: 'Structured API docs with endpoints, parameters, and examples',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-03'),
    },
    {
      id: '3',
      title: 'User Story Writer',
      promptText: 'Create detailed user stories for agile development',
      category: 'Project Management',
      tags: 'agile, scrum, planning',
      expectedOutput: 'Well-formatted user stories with acceptance criteria',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
    },
    {
      id: '4',
      title: 'SQL Query Optimizer',
      promptText: 'Optimize SQL queries for better performance',
      category: 'Database',
      tags: 'sql, database, performance',
      expectedOutput: 'Optimized query with explanation of improvements',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-10'),
    },
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

  const handleCopyToClipboard = (text: string, promptId: string) => {
    void navigator.clipboard.writeText(text);
    // Update lastUsed timestamp
    setPrompts(prev => prev.map(p =>
      p.id === promptId ? { ...p, lastUsed: new Date() } : p
    ));
  };

  const handleCopySuccess = useCallback(() => {
    showToast('Copied to clipboard!', 'success');
    // Update lastUsed timestamp for the selected prompt
    if (selectedPrompt) {
      setPrompts(prev => prev.map(p =>
        p.id === selectedPrompt.id ? { ...p, lastUsed: new Date() } : p
      ));
    }
  }, [showToast, selectedPrompt]);

  const handleCopyError = useCallback((error: Error) => {
    showToast('Failed to copy to clipboard', 'error');
    console.error('Copy failed:', error);
  }, [showToast]);

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
    
    // Reset form
    setFormData({
      title: '',
      promptText: '',
      category: '',
      tags: '',
      expectedOutput: '',
      notes: '',
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Development': 'bg-blue-100 text-blue-800',
      'Documentation': 'bg-green-100 text-green-800',
      'Project Management': 'bg-purple-100 text-purple-800',
      'Database': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prompt Database</h1>
                <p className="text-sm text-gray-500">Manage and organize your AI prompts</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {prompts.length} total prompts
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Panel - Prompt List */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filter Section */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter and Sort Controls */}
              <div className="flex gap-2">
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as SearchField)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">🔍 All Fields</option>
                  <option value="title">📝 Title</option>
                  <option value="promptText">💬 Prompt Text</option>
                  <option value="category">📁 Category</option>
                  <option value="tags">🏷️ Tags</option>
                </select>
                
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="title">Sort: Title</option>
                  <option value="category">Sort: Category</option>
                  <option value="createdAt">Sort: Created</option>
                  <option value="updatedAt">Sort: Updated</option>
                </select>
                
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {paginatedPrompts.length} of {sortedPrompts.length} results
              {searchQuery && ` (${prompts.length} total)`}
            </div>
          </div>

          {/* Prompt List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {paginatedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      onClick={() => handleEdit(prompt)}
                      className="flex-1"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{prompt.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(prompt.category)}`}>
                          {prompt.category || 'Uncategorized'}
                        </span>
                        {prompt.lastUsed && (
                          <span className="text-xs text-green-600">
                            ✓ Used recently
                          </span>
                        )}
                      </div>
                      {prompt.promptText && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {prompt.promptText}
                        </p>
                      )}
                      {prompt.tags && (
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.split(',').map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-3">
                      {prompt.promptText && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(prompt.promptText || '', prompt.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prompt.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete prompt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {paginatedPrompts.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No prompts found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPrompt ? '✏️ Edit Prompt' : '➕ Create New Prompt'}
                  </h2>
                  {selectedPrompt && (
                    <button
                      onClick={() => {
                        setSelectedPrompt(null);
                        setFormData({
                          title: '',
                          promptText: '',
                          category: '',
                          tags: '',
                          expectedOutput: '',
                          notes: '',
                        });
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a descriptive title for your prompt"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prompt Text
                      </label>
                      {selectedPrompt && formData.promptText && (
                        <CopyToClipboard
                          text={formData.promptText}
                          buttonText="Copy"
                          onCopy={handleCopySuccess}
                          onError={handleCopyError}
                        />
                      )}
                    </div>
                    <textarea
                      value={formData.promptText}
                      onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Enter the actual prompt text to be used"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        <option value="Development">Development</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Database">Database</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., code, review, optimization"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Output
                    </label>
                    <textarea
                      value={formData.expectedOutput}
                      onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe what output you expect from this prompt"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Any additional notes or context"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      {selectedPrompt ? 'Update Prompt' : 'Create Prompt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          title: '',
                          promptText: '',
                          category: '',
                          tags: '',
                          expectedOutput: '',
                          notes: '',
                        });
                        setSelectedPrompt(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnhancedMainApp() {
  return (
    <ToastProvider>
      <EnhancedMainAppInner />
    </ToastProvider>
  );
}