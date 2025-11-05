import { useState, useMemo } from 'react';
import { usePromptStore } from '@/store/promptStore';
import { Dialog } from '@headlessui/react';
import { useToast } from '@/hooks/useToast';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface CategoryDisplay {
  id: string;
  name: string;
  color: string;
  description?: string;
  promptCount: number;
  lastUsed?: Date;
  isStored?: boolean; // Whether this category is in the categories store
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCategory?: (categoryName: string) => void;
}

export function CategoryManager({ isOpen, onClose, onViewCategory }: CategoryManagerProps) {
  const { prompts, updatePrompt, categories, addCategory, removeCategory, updateCategory } = usePromptStore();
  const { showToast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDisplay | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDisplay | null>(null);

  // Calculate categories from existing prompts and merge with stored categories
  const displayCategories = useMemo(() => {
    const categoryMap = new Map<string, CategoryDisplay>();
    
    // First, add stored categories
    categories.forEach((stored) => {
      categoryMap.set(stored.name, {
        id: stored.id,
        name: stored.name,
        color: stored.color || PRESET_COLORS[categoryMap.size % PRESET_COLORS.length],
        description: stored.description,
        promptCount: 0,
        isStored: true
      });
    });
    
    // Then add categories from prompts (updates promptCount for existing ones)
    prompts.forEach((prompt: any) => {
      const categoryName = prompt.category || 'Uncategorized';
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          color: PRESET_COLORS[categoryMap.size % PRESET_COLORS.length],
          promptCount: 0
        });
      }
      
      const category = categoryMap.get(categoryName);
      if (category) {
        category.promptCount++;
        
        if (prompt.lastUsed) {
          const lastUsed = new Date(prompt.lastUsed);
          if (!category.lastUsed || lastUsed > category.lastUsed) {
            category.lastUsed = lastUsed;
          }
        }
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.promptCount - a.promptCount);
  }, [prompts, categories]);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    // Check if category already exists
    if (displayCategories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      showToast('Category already exists', 'error');
      return;
    }
    
    // Add category to store
    addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      description: newCategoryDescription.trim() || undefined
    });

    showToast('Category created successfully', 'success');
    setNewCategoryName('');
    setNewCategoryColor(PRESET_COLORS[0]);
    setNewCategoryDescription('');
    setShowCreateForm(false);
  };

  const handleEditCategory = (category: CategoryDisplay) => {
    if (category.name === 'Uncategorized') return;
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryDescription(category.description || '');
    setShowCreateForm(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    const oldName = editingCategory.name;
    const newName = newCategoryName.trim();

    // Check if name is already used by another category
    const nameExists = displayCategories.some(
      cat => cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== editingCategory.id
    );

    if (nameExists) {
      showToast('A category with this name already exists', 'error');
      return;
    }

    // Update category in store if it's stored
    if (editingCategory.isStored) {
      updateCategory(editingCategory.id, {
        name: newName,
        color: newCategoryColor,
        description: newCategoryDescription.trim() || undefined
      });
    }

    // Update all prompts that use this category
    prompts.forEach((prompt: any) => {
      if (prompt.category === oldName) {
        updatePrompt(prompt.id, { category: newName });
      }
    });

    showToast('Category updated successfully', 'success');
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryColor(PRESET_COLORS[0]);
    setNewCategoryDescription('');
  };

  const handleDeleteCategory = (category: CategoryDisplay) => {
    if (category.name === 'Uncategorized') return;
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    // Remove category from all prompts
    prompts.forEach((prompt: any) => {
      if (prompt.category === categoryToDelete.name) {
        updatePrompt(prompt.id, { category: '' });
      }
    });
    
    // Remove category from store if it's stored
    if (categoryToDelete.isStored) {
      removeCategory(categoryToDelete.id);
    }
    
    showToast('Category deleted successfully', 'success');
    setCategoryToDelete(null);
  };

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">Category Management</Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                Managing {displayCategories.length} categories across {prompts.length} prompts
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>

            {/* Create/Edit Category Form */}
            {(showCreateForm || editingCategory) && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Data Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Brief description of this category's purpose"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCategory(null);
                      setNewCategoryName('');
                      setNewCategoryColor(PRESET_COLORS[0]);
                      setNewCategoryDescription('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCategories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Prompts:</span>
                      <span className="font-medium">{category.promptCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last used:</span>
                      <span>{formatLastUsed(category.lastUsed)}</span>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      {category.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        onViewCategory?.(category.name);
                        onClose();
                      }}
                      className="flex-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      View Prompts
                    </button>
                    {category.name !== 'Uncategorized' && (
                      <>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {displayCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                <p className="text-gray-600 mb-4">
                  Start organizing your prompts by creating categories
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First Category
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={
          categoryToDelete && categoryToDelete.promptCount > 0
            ? `This will remove the category from ${categoryToDelete.promptCount} prompt(s). The prompts will be moved to "Uncategorized".`
            : 'Are you sure you want to delete this category? This action cannot be undone.'
        }
        itemName={categoryToDelete?.name}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Dialog>
  );
}