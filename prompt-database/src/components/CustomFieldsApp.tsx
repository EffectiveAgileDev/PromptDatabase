import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePromptStore } from '@/store/promptStore';
import { FieldManager } from './FieldManager';
import { DynamicField } from './DynamicField';
import { CopyToClipboard } from './CopyToClipboard';
import { Welcome } from './Welcome';
import { CategoryManager } from './CategoryManager';
import { ImportExport } from './ImportExport';
import { AutoSaveTest } from './AutoSaveTest';
import { useToast } from '@/hooks/useToast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Dialog } from '@headlessui/react';

type SearchField = 'title' | 'promptText' | 'category' | 'tags' | 'all';
type SortField = 'title' | 'category' | 'createdAt' | 'updatedAt' | 'lastUsed';
type SortDirection = 'asc' | 'desc';

export function CustomFieldsApp() {
  const { showToast } = useToast();
  const {
    prompts,
    selectedPromptId,
    customFields,
    addPrompt,
    updatePrompt,
    deletePrompt,
    selectPrompt,
    getSelectedPrompt,
    updateLastUsed
  } = usePromptStore();

  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(prompts.length === 0);
  const itemsPerPage = 10;

  const selectedPrompt = getSelectedPrompt();

  // Hide welcome screen when prompts are added
  useEffect(() => {
    if (prompts.length > 0 && showWelcome) {
      setShowWelcome(false);
    }
  }, [prompts.length, showWelcome]);

  // Form data state
  const [formData, setFormData] = useState(() => {
    if (selectedPrompt) {
      return {
        title: selectedPrompt.title,
        promptText: selectedPrompt.promptText || '',
        category: selectedPrompt.category || '',
        tags: selectedPrompt.tags || '',
        expectedOutput: selectedPrompt.expectedOutput || '',
        notes: selectedPrompt.notes || '',
        customFields: selectedPrompt.customFields || {}
      };
    }
    return {
      title: '',
      promptText: '',
      category: '',
      tags: '',
      expectedOutput: '',
      notes: '',
      customFields: {}
    };
  });

  // Filter prompts based on search
  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return prompts;
    
    const query = searchQuery.toLowerCase();
    return prompts.filter((prompt: any) => {
      if (searchField === 'all') {
        return (
          prompt.title?.toLowerCase().includes(query) ||
          prompt.promptText?.toLowerCase().includes(query) ||
          prompt.category?.toLowerCase().includes(query) ||
          prompt.tags?.toLowerCase().includes(query) ||
          prompt.notes?.toLowerCase().includes(query) ||
          // Search in custom fields
          Object.values(prompt.customFields || {}).some(value =>
            String(value).toLowerCase().includes(query)
          )
        );
      }
      
      // Check if searching in a custom field
      const customField = customFields.find((f: any) => f.name === searchField);
      if (customField) {
        const fieldValue = prompt.customFields?.[customField.id];
        return fieldValue && String(fieldValue).toLowerCase().includes(query);
      }
      
      // Search in standard fields
      const fieldValue = prompt[searchField as keyof typeof prompt];
      return fieldValue && String(fieldValue).toLowerCase().includes(query);
    });
  }, [prompts, searchQuery, searchField, customFields]);

  // Sort prompts
  const sortedPrompts = useMemo(() => {
    const sorted = [...filteredPrompts].sort((a, b) => {
      // Check if sorting by a custom field
      const customField = customFields.find((f: any) => f.name === sortField);
      let aValue, bValue;
      
      if (customField) {
        aValue = a.customFields?.[customField.id];
        bValue = b.customFields?.[customField.id];
      } else {
        aValue = a[sortField as keyof typeof a];
        bValue = b[sortField as keyof typeof b];
      }
      
      if (aValue === bValue) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredPrompts, sortField, sortDirection, customFields]);

  // Paginated prompts
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPrompts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPrompts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPrompts.length / itemsPerPage);

  // Update form when selection changes
  const handleSelectPrompt = (prompt: typeof prompts[0]) => {
    selectPrompt(prompt.id);
    setFormData({
      title: prompt.title,
      promptText: prompt.promptText || '',
      category: prompt.category || '',
      tags: prompt.tags || '',
      expectedOutput: prompt.expectedOutput || '',
      notes: prompt.notes || '',
      customFields: prompt.customFields || {}
    });
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    selectPrompt(null);
    setFormData({
      title: '',
      promptText: '',
      category: '',
      tags: '',
      expectedOutput: '',
      notes: '',
      customFields: {}
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    if (isCreating) {
      addPrompt(formData);
      showToast('Prompt created successfully', 'success');
      setIsCreating(false);
    } else if (selectedPrompt) {
      updatePrompt(selectedPrompt.id, formData);
      showToast('Prompt updated successfully', 'success');
    }
  };

  // Auto-save functionality for existing prompts
  const { isAutoSaving, lastSaved, forceSave } = useAutoSave({
    data: formData,
    onSave: useCallback(async (data) => {
      // Only auto-save existing prompts, not new ones
      if (selectedPrompt && !isCreating && data.title.trim()) {
        console.log('Auto-saving prompt:', selectedPrompt.id, data.title);
        updatePrompt(selectedPrompt.id, data);
      }
    }, [selectedPrompt, isCreating, updatePrompt]),
    enabled: !isCreating && selectedPrompt !== null,
    delay: 1000 // 1 second delay for auto-save
  });

  // Keyboard shortcuts
  const { formatShortcut } = useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'n',
        ctrlKey: true,
        action: handleCreateNew,
        description: 'Create new prompt'
      },
      {
        key: 's',
        ctrlKey: true,
        action: () => {
          if (isCreating || selectedPrompt) {
            handleSave();
          }
        },
        description: 'Save current prompt'
      },
      {
        key: 'f',
        ctrlKey: true,
        action: () => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        },
        description: 'Focus search'
      },
      {
        key: '/',
        action: () => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        },
        description: 'Focus search'
      },
      {
        key: 'Delete',
        action: () => {
          if (selectedPrompt && confirm('Are you sure you want to delete this prompt?')) {
            handleDelete();
          }
        },
        description: 'Delete selected prompt'
      },
      {
        key: 'ArrowUp',
        action: () => {
          if (paginatedPrompts.length > 0) {
            const currentIndex = paginatedPrompts.findIndex(p => p.id === selectedPromptId);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : paginatedPrompts.length - 1;
            handleSelectPrompt(paginatedPrompts[prevIndex]);
          }
        },
        description: 'Select previous prompt'
      },
      {
        key: 'ArrowDown',
        action: () => {
          if (paginatedPrompts.length > 0) {
            const currentIndex = paginatedPrompts.findIndex(p => p.id === selectedPromptId);
            const nextIndex = currentIndex < paginatedPrompts.length - 1 ? currentIndex + 1 : 0;
            handleSelectPrompt(paginatedPrompts[nextIndex]);
          }
        },
        description: 'Select next prompt'
      },
      {
        key: 'c',
        ctrlKey: true,
        action: () => {
          if (selectedPrompt && formData.promptText) {
            navigator.clipboard?.writeText(formData.promptText);
            updateLastUsed(selectedPrompt.id);
            showToast('Prompt copied to clipboard', 'success');
          }
        },
        description: 'Copy prompt text'
      },
      {
        key: '?',
        action: () => setShowKeyboardHelp(true),
        description: 'Show keyboard shortcuts',
        preventDefault: false
      }
    ],
    enabled: !showWelcome
  });

  const handleDelete = () => {
    if (selectedPrompt && confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(selectedPrompt.id);
      showToast('Prompt deleted successfully', 'success');
    }
  };

  const handleCopySuccess = useCallback((_text: string) => {
    if (selectedPrompt) {
      updateLastUsed(selectedPrompt.id);
    }
  }, [selectedPrompt, updateLastUsed]);

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  const _handleSort = (field: SortField | string) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as SortField);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Build search field options including custom fields
  const searchFieldOptions = [
    { value: 'all', label: '🔍 All Fields' },
    { value: 'title', label: '📝 Title' },
    { value: 'promptText', label: '💬 Prompt Text' },
    { value: 'category', label: '📁 Category' },
    { value: 'tags', label: '🏷️ Tags' },
    ...customFields.map((field: any) => ({
      value: field.name,
      label: `⚙️ ${field.name}`
    }))
  ];

  // Show welcome screen for new users
  if (showWelcome) {
    return (
      <Welcome
        onCreateFirst={() => {
          setShowWelcome(false);
          setIsCreating(true);
        }}
        onSkipTour={() => {
          setShowWelcome(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Prompt Database</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Keyboard shortcuts (?)"
              >
                ⌨️
              </button>
              <button
                onClick={() => setShowImportExport(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Import/Export
              </button>
              <button
                onClick={() => setShowCategoryManager(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                📁 Categories
              </button>
              <button
                onClick={() => setShowFieldManager(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ⚙️ Manage Fields
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Prompt
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2" role="search" aria-label="Search prompts">
            <div className="flex-1 relative">
              <label htmlFor="search-input" className="sr-only">
                Search prompts in {searchFieldOptions.find(o => o.value === searchField)?.label.replace(/[🔍📝💬📁🏷️⚙️] /, '')}
              </label>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search in ${searchFieldOptions.find(o => o.value === searchField)?.label.replace(/[🔍📝💬📁🏷️⚙️] /, '')}...`}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="search-results"
              />
              <span className="absolute left-3 top-2.5 text-gray-400" aria-hidden="true">🔍</span>
            </div>
            <label htmlFor="search-field-select" className="sr-only">
              Search field
            </label>
            <select
              id="search-field-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search field selector"
            >
              {searchFieldOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {searchQuery && (
            <div id="search-results" className="mt-2 text-sm text-gray-600" aria-live="polite" aria-atomic="true">
              Found {filteredPrompts.length} result{filteredPrompts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Auto-Save Test (temporary) */}
        <div className="mb-6">
          <AutoSaveTest />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Prompts</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortField}
                    onChange={(e) => _handleSort(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="updatedAt">Last Modified</option>
                    <option value="createdAt">Created Date</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                    <option value="lastUsed">Last Used</option>
                    {customFields.map((field: any) => (
                      <option key={field.id} value={field.name}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <svg className={`w-4 h-4 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {sortedPrompts.length} total
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4" role="listbox" aria-label="Prompt list">
              {paginatedPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  role="option"
                  aria-selected={selectedPromptId === prompt.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectPrompt(prompt);
                    }
                  }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedPromptId === prompt.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  aria-describedby={`prompt-${prompt.id}-details`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                      {prompt.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-1">
                          {prompt.category}
                        </span>
                      )}
                      {prompt.promptText && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                          {prompt.promptText}
                        </p>
                      )}
                      {/* Show custom field values */}
                      {customFields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {customFields.slice(0, 3).map((field: any) => {
                            const value = prompt.customFields?.[field.id];
                            if (!value) return null;
                            return (
                              <span key={field.id} className="text-xs text-gray-500">
                                {field.name}: {String(value).substring(0, 20)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {prompt.lastUsed && (
                      <span className="text-xs text-gray-400">
                        Used {new Date(prompt.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {/* Hidden details for screen readers */}
                  <div id={`prompt-${prompt.id}-details`} className="sr-only">
                    {prompt.category && `Category: ${prompt.category}. `}
                    {prompt.promptText && `Content: ${prompt.promptText.substring(0, 100)}... `}
                    {prompt.lastUsed && `Last used: ${new Date(prompt.lastUsed).toLocaleDateString()}.`}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Prompt Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4" id="prompt-form-heading">
              {isCreating ? 'Create New Prompt' : selectedPrompt ? 'Edit Prompt' : 'Select a Prompt'}
            </h2>

            {(selectedPrompt || isCreating) && (
              <form className="space-y-4" aria-labelledby="prompt-form-heading" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {/* Status region for screen readers */}
                <div aria-live="polite" aria-atomic="true" className="sr-only">
                  {isAutoSaving && "Auto-saving prompt..."}
                  {lastSaved && !isAutoSaving && "Prompt auto-saved successfully"}
                </div>
                
                <div>
                  <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    id="prompt-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a unique title"
                    required
                    aria-describedby="title-help"
                  />
                  <div id="title-help" className="sr-only">
                    Enter a unique title for your prompt. This field is required.
                  </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter your prompt text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="comma, separated, tags"
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
                    {customFields.map((field: any) => (
                      <DynamicField
                        key={field.id}
                        field={field}
                        value={formData.customFields[field.id]}
                        onChange={(value) => handleCustomFieldChange(field.id, value)}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Output
                  </label>
                  <textarea
                    value={formData.expectedOutput}
                    onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the expected output"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <div className="flex-1 flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isCreating ? 'Create' : 'Save'}
                    </button>
                    
                    {/* Auto-save status indicator */}
                    {!isCreating && selectedPrompt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {isAutoSaving ? (
                          <>
                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Auto-saving...</span>
                          </>
                        ) : lastSaved ? (
                          <>
                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Auto-saved</span>
                          </>
                        ) : (
                          <span>Auto-save enabled</span>
                        )}
                        <button
                          onClick={forceSave}
                          className="text-blue-600 hover:text-blue-800 underline"
                          title="Force save now"
                        >
                          Save now
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {selectedPrompt && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field Manager Dialog */}
        <Dialog
          open={showFieldManager}
          onClose={() => setShowFieldManager(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Manage Custom Fields
                  </Dialog.Title>
                  <button
                    onClick={() => setShowFieldManager(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <FieldManager />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Category Manager Modal */}
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
        />

        {/* Import/Export Modal */}
        <ImportExport
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
        />

        {/* Keyboard Shortcuts Help */}
        <Dialog
          open={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                    ⌨️ Keyboard Shortcuts
                  </Dialog.Title>
                  <button
                    onClick={() => setShowKeyboardHelp(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'Ctrl + N', description: 'Create new prompt' },
                    { key: 'Ctrl + S', description: 'Save current prompt' },
                    { key: 'Ctrl + F', description: 'Focus search' },
                    { key: '/', description: 'Focus search' },
                    { key: 'Ctrl + C', description: 'Copy prompt text' },
                    { key: '↑ / ↓', description: 'Navigate prompts' },
                    { key: 'Delete', description: 'Delete selected prompt' },
                    { key: '?', description: 'Show this help' }
                  ].map(({ key, description }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">{description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowKeyboardHelp(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}