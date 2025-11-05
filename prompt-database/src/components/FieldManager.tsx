import React, { useState } from 'react';
import { usePromptStore } from '@/store/promptStore';
import { Dialog } from '@headlessui/react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import type { CustomField, FieldType } from '@/types/customFields';

interface AddFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Omit<CustomField, 'id'>) => void;
  existingFieldNames: string[];
}

const AddFieldDialog: React.FC<AddFieldDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  existingFieldNames
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [options, setOptions] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (!name.trim()) {
      setError('Field name is required');
      return;
    }

    if (existingFieldNames.includes(name.trim())) {
      setError('Field name already exists');
      return;
    }

    const optionsArray = type === 'select' 
      ? options.split(',').map(o => o.trim()).filter(Boolean)
      : [];

    onSave({
      name: name.trim(),
      type,
      options: optionsArray
    });

    // Reset form
    setName('');
    setType('text');
    setOptions('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setType('text');
    setOptions('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add Custom Field
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label htmlFor="field-name" className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                id="field-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Project, Token Count"
              />
            </div>

            <div>
              <label htmlFor="field-type" className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                id="field-type"
                value={type}
                onChange={(e) => setType(e.target.value as FieldType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select (Dropdown)</option>
              </select>
            </div>

            {type === 'select' && (
              <div>
                <label htmlFor="field-options" className="block text-sm font-medium text-gray-700 mb-1">
                  Options (comma-separated)
                </label>
                <input
                  id="field-options"
                  type="text"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Easy,Medium,Hard"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Field
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};


export const FieldManager: React.FC = () => {
  const { customFields, addCustomField, removeCustomField } = usePromptStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteField, setDeleteField] = useState<CustomField | null>(null);

  const handleAddField = (field: Omit<CustomField, 'id'>) => {
    addCustomField(field);
  };

  const handleDeleteField = (field: CustomField) => {
    setDeleteField(field);
  };

  const confirmDelete = () => {
    if (deleteField) {
      removeCustomField(deleteField.id);
      setDeleteField(null);
    }
  };

  const cancelDelete = () => {
    setDeleteField(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Custom Fields</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Custom Field
        </button>
      </div>

      {customFields.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No custom fields yet. Add a custom field to extend your prompts with additional information.
        </p>
      ) : (
        <div className="space-y-3">
          {customFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium">{field.name}</div>
                <div className="text-sm text-gray-500">
                  <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                    {field.type}
                  </span>
                  {field.options && field.options.length > 0 && (
                    <span className="ml-2 text-gray-400">
                      Options: {field.options.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteField(field)}
                className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label={`Delete ${field.name}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <AddFieldDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddField}
        existingFieldNames={customFields.map(f => f.name)}
      />

      <DeleteConfirmationDialog
        isOpen={deleteField !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Custom Field"
        message={`Are you sure you want to delete the field "${deleteField?.name}"? Existing data in this field will be preserved but the field will no longer appear in forms.`}
        itemName={deleteField?.name}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};