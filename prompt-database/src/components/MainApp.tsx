import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useToast } from '../hooks/useToast';
import { CopyToClipboard } from './CopyToClipboard';
import { usePerformanceMonitor, PerformanceHints, VirtualList } from './PerformanceOptimizations';
import { 
  AccessibilityTester, 
  SkipNavigation, 
  ScreenReaderAnnouncement,
  useFocusManagement,
  FormField
} from './AccessibilityEnhancements';

// Lazy load heavy components for better performance
const FieldManager = lazy(() => import('./FieldManager').then(module => ({ default: module.FieldManager })));
const ImportExport = lazy(() => import('./ImportExport').then(module => ({ default: module.ImportExport })));

interface Prompt {
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

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  required?: boolean;
}

type SortField = 'title' | 'category' | 'createdAt' | 'updatedAt';
type SearchField = 'title' | 'promptText' | 'category' | 'tags' | 'all';

export function MainApp() {
  const { showToast } = useToast();
  const { focusElement, trapFocus } = useFocusManagement();
  
  // Performance monitoring
  const performanceMetrics = usePerformanceMonitor([]);
  
  // Accessibility state
  const [announcement, setAnnouncement] = useState('');
  const [categories] = useState([
    'Development', 'General', 'Project Management', 'Writing', 'Research', 
    'Marketing', 'Documentation', 'Analysis', 'Creative', 'Support'
  ]);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: 'priority',
      name: 'Priority',
      type: 'select',
      options: ['Low', 'Medium', 'High', 'Critical'],
      required: false
    },
    {
      id: 'usecase',
      name: 'Use Case',
      type: 'text',
      required: false
    }
  ]);
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
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    try {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) {
        return stored === 'true';
      }
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false; // Default to light mode
    } catch (error) {
      console.error('Error reading dark mode preference:', error);
      return false;
    }
  });
  
  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    category: '',
    tags: '',
    expectedOutput: '',
    notes: '',
    customFields: {} as Record<string, any>,
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

  // Sort functionality would be implemented here
  // const handleSort = (field: SortField) => {
  //   if (sortField === field) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortField(field);
  //     setSortDirection('asc');
  //   }
  // };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
      showToast('Prompt deleted successfully', 'success');
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
      customFields: prompt.customFields || {},
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    
    if (selectedPrompt) {
      // Update existing prompt
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id 
          ? { ...p, ...formData, updatedAt: new Date() }
          : p
      ));
      setSelectedPrompt(null);
      showToast('Prompt updated successfully', 'success');
    } else {
      // Create new prompt
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPrompts([...prompts, newPrompt]);
      showToast('Prompt created successfully', 'success');
    }
    
    setFormData({
      title: '',
      promptText: '',
      category: '',
      tags: '',
      expectedOutput: '',
      notes: '',
      customFields: {},
    });
  };

  const handleCopySuccess = (text: string) => {
    if (selectedPrompt) {
      // Update lastUsed timestamp
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id 
          ? { ...p, lastUsed: new Date(), updatedAt: new Date() }
          : p
      ));
      showToast('Prompt copied to clipboard', 'success');
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  // Auto-save functionality for existing prompts
  const autoSave = useCallback(() => {
    if (selectedPrompt && formData.title.trim()) {
      setPrompts(prev => prev.map(p => 
        p.id === selectedPrompt.id 
          ? { ...p, ...formData, updatedAt: new Date() }
          : p
      ));
    }
  }, [selectedPrompt, formData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (selectedPrompt && formData.title.trim()) {
      const timer = setTimeout(() => {
        autoSave();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [formData, selectedPrompt, autoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (selectedPrompt || formData.title.trim()) {
          const form = document.querySelector('form');
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }
      }
      
      // Ctrl+C: Copy prompt text
      if (e.ctrlKey && e.key === 'c' && formData.promptText && selectedPrompt) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          navigator.clipboard?.writeText(formData.promptText);
          handleCopySuccess(formData.promptText);
        }
      }

      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // /: Focus search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData, selectedPrompt, handleCopySuccess]);

  // Initialize dark mode on mount
  useEffect(() => {
    console.log('Initial dark mode setup:', darkMode);
    console.log('Document classes before:', document.documentElement.className);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('Document classes after:', document.documentElement.className);
  }, []); // Run once on mount

  // Dark mode effect
  useEffect(() => {
    console.log('Dark mode state changed:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('darkMode', darkMode.toString());
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    console.log('Toggle dark mode clicked, current state:', darkMode);
    const newMode = !darkMode;
    console.log('Setting new dark mode:', newMode);
    setDarkMode(newMode);
    showToast(`Switched to ${newMode ? 'dark' : 'light'} mode`, 'success');
  }, [darkMode, showToast]);

  return (
    <>
      <SkipNavigation />
      <AccessibilityTester enabled={import.meta.env.DEV} />
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} priority="polite" />
      )}
      
      <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors"
        style={{
          backgroundColor: darkMode ? '#111827' : '#f9fafb',
          color: darkMode ? '#ffffff' : '#000000'
        }}
      >
      <header 
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Database</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              type="button"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'} (Current: {darkMode ? 'Dark' : 'Light'})
            </button>
            <button
              onClick={() => {
                const dataToExport = {
                  version: '1.0',
                  exportDate: new Date().toISOString(),
                  customFields,
                  prompts
                };
                const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast(`Exported ${prompts.length} prompts`, 'success');
              }}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Export Data
            </button>
            <button
              onClick={() => setShowFieldManager(true)}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              ⚙️ Manage Fields
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span>⌨️ Shortcuts: Ctrl+S (Save) • Ctrl+C (Copy) • Ctrl+F or / (Search)</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex h-[calc(100vh-64px)]">
        {/* Prompt List */}
        <aside 
          className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
          aria-label="Prompt list and search"
        >
          <div className="p-4">
            {/* Search Controls */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="search-input" className="sr-only">
                    Search prompts
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                      if (e.target.value) {
                        setAnnouncement(`Searching for "${e.target.value}". ${sortedPrompts.length} results found.`);
                      }
                    }}
                    placeholder="Search prompts..."
                    aria-describedby="search-field-select"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="search-field-select" className="sr-only">
                    Search in field
                  </label>
                  <select
                    id="search-field-select"
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value as SearchField)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Fields</option>
                    <option value="title">Title</option>
                    <option value="promptText">Prompt Text</option>
                    <option value="category">Category</option>
                    <option value="tags">Tags</option>
                  </select>
                </div>
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

            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Prompts ({sortedPrompts.length} / {prompts.length})
            </h2>
            
            <div className="space-y-2" role="list" aria-label="Prompt items">
              {paginatedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  role="listitem"
                  className={`p-3 border rounded-lg transition-colors ${
                    selectedPrompt?.id === prompt.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => {
                        handleEdit(prompt);
                        setAnnouncement(`Selected prompt: ${prompt.title}`);
                      }}
                      className="flex-1 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-describedby={`prompt-${prompt.id}-details`}
                    >
                      <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                      <div id={`prompt-${prompt.id}-details`} className="text-sm text-gray-500 mt-1">
                        <p>{prompt.category || 'No category'}</p>
                        {prompt.tags && (
                          <p className="text-xs text-gray-400 mt-1">
                            Tags: {prompt.tags}
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
                          handleDelete(prompt.id);
                          setAnnouncement(`Deleted prompt: ${prompt.title}`);
                        }
                      }}
                      className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete prompt: ${prompt.title}`}
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
        </aside>

        {/* Prompt Form */}
        <section 
          className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800"
          aria-label="Prompt editor"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Prompt Text
                </label>
                {formData.promptText && (
                  <CopyToClipboard
                    text={formData.promptText}
                    buttonText="Copy"
                    onCopy={handleCopySuccess}
                  />
                )}
              </div>
              <textarea
                value={formData.promptText}
                onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter your prompt text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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
                placeholder="Additional notes"
              />
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData.customFields[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                      >
                        <option value="">Select {field.name}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData.customFields[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                      />
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={formData.customFields[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.customFields[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedPrompt ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </form>
        </section>
      </main>

      {/* Simple Field Manager Modal */}
      {showFieldManager && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Manage Custom Fields</h2>
              <button
                onClick={() => setShowFieldManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Current Fields:</h3>
              {customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{field.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomFields(prev => prev.filter(f => f.id !== field.id));
                      showToast(`Removed field: ${field.name}`, 'success');
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {customFields.length === 0 && (
                <p className="text-gray-500 text-sm">No custom fields added yet.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t space-y-3">
              <button
                onClick={() => {
                  const fieldName = prompt('Enter field name:');
                  if (fieldName) {
                    const newField: CustomField = {
                      id: fieldName.toLowerCase().replace(/\s+/g, '_'),
                      name: fieldName,
                      type: 'text',
                      required: false
                    };
                    setCustomFields(prev => [...prev, newField]);
                    showToast(`Added field: ${fieldName}`, 'success');
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Text Field
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          if (data.prompts && Array.isArray(data.prompts)) {
                            setPrompts(prev => [...prev, ...data.prompts]);
                            if (data.customFields && Array.isArray(data.customFields)) {
                              setCustomFields(data.customFields);
                            }
                            showToast(`Imported ${data.prompts.length} prompts`, 'success');
                            setShowFieldManager(false);
                          } else {
                            showToast('Invalid file format', 'error');
                          }
                        } catch (error) {
                          showToast('Failed to parse file', 'error');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  📥 Import JSON Data
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowFieldManager(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Performance hints for development */}
      {import.meta.env.DEV && <PerformanceHints metrics={performanceMetrics} />}
      </div>
    </>
  );
}