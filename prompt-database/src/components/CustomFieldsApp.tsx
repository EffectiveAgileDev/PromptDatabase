import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePromptStore } from '@/store/promptStore';
import { FieldManager } from './FieldManager';
import { DynamicField } from './DynamicField';
import { CopyToClipboard } from './CopyToClipboard';
import { Welcome } from './Welcome';
import { CategoryManager } from './CategoryManager';
import { ImportExport } from './ImportExport';
import { useToast } from '@/hooks/useToast';
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
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search in ${searchFieldOptions.find(o => o.value === searchField)?.label.replace(/[🔍📝💬📁🏷️⚙️] /, '')}...`}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {searchFieldOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredPrompts.length} result{filteredPrompts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Prompts</h2>
              <span className="text-sm text-gray-500">
                {sortedPrompts.length} total
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {paginatedPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedPromptId === prompt.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
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
            <h2 className="text-lg font-semibold mb-4">
              {isCreating ? 'Create New Prompt' : selectedPrompt ? 'Edit Prompt' : 'Select a Prompt'}
            </h2>

            {(selectedPrompt || isCreating) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a unique title"
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
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isCreating ? 'Create' : 'Save'}
                  </button>
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
      </div>
    </div>
  );
}