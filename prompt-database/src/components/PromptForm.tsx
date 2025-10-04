import { useState } from 'react';
import { useAppStore } from '@/store/promptStore';
import { validatePrompt } from '@/lib/validation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { promptModel } from '@/lib/promptModel';

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

interface PromptFormProps {
  prompt?: Prompt;
}

export function PromptForm({ prompt }: PromptFormProps) {
  const { addPrompt, updatePrompt, prompts } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: prompt?.title || '',
    promptText: prompt?.promptText || '',
    category: prompt?.category || '',
    tags: prompt?.tags || '',
    expectedOutput: prompt?.expectedOutput || '',
    notes: prompt?.notes || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save for existing prompts
  const { isAutoSaving } = useAutoSave(
    formData,
    (data) => prompt && updatePrompt(prompt.id, data),
    500,
    !!prompt
  );

  const validateForm = () => {
    const validation = validatePrompt(formData, prompts.items, prompt?.id);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (prompt) {
        const updated = await promptModel.updatePrompt(prompt.id, formData);
        updatePrompt(prompt.id, updated);
      } else {
        const newPrompt = await promptModel.createPrompt(formData);
        addPrompt(newPrompt);
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
      // Error will be handled by validation or shown via the model
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4">
      {isAutoSaving && (
        <div data-testid="auto-save-indicator" className="text-sm text-blue-600">
          Saving...
        </div>
      )}
      
      <div>
        <input
          data-testid="prompt-title-input"
          type="text"
          placeholder="Title (required)"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full p-2 border rounded"
        />
        {errors.title && (
          <div className="text-red-600 text-sm mt-1">{errors.title}</div>
        )}
      </div>

      <div>
        <textarea
          data-testid="prompt-text-input"
          placeholder="Prompt text"
          value={formData.promptText}
          onChange={(e) => handleInputChange('promptText', e.target.value)}
          className="w-full p-2 border rounded h-32"
        />
      </div>

      <div>
        <select
          data-testid="prompt-category-select"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select category</option>
          <option value="Technical">Technical</option>
          <option value="Creative">Creative</option>
          <option value="Business">Business</option>
        </select>
      </div>

      <div>
        <input
          data-testid="prompt-tags-input"
          type="text"
          placeholder="Tags (comma-separated)"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <textarea
          data-testid="prompt-expected-output-input"
          placeholder="Expected output"
          value={formData.expectedOutput}
          onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
          className="w-full p-2 border rounded h-20"
        />
      </div>

      <div>
        <textarea
          data-testid="prompt-notes-input"
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full p-2 border rounded h-20"
        />
      </div>

      <button
        data-testid="save-prompt-button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {prompt ? 'Update Prompt' : 'Save Prompt'}
      </button>
    </div>
  );
}