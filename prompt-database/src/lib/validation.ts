import { useAppStore } from '@/store/promptStore'; type Prompt = ReturnType<typeof useAppStore>['prompts']['items'] extends Map<string, infer T> ? T : never;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePrompt(
  formData: {
    title: string;
    promptText?: string;
    category?: string;
    tags?: string;
    expectedOutput?: string;
    notes?: string;
  },
  existingPrompts: Map<string, Prompt>,
  currentPromptId?: string
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  } else {
    // Check title uniqueness
    const existingPrompt = Array.from(existingPrompts.values())
      .find(p => p.title === formData.title.trim() && p.id !== currentPromptId);
    
    if (existingPrompt) {
      errors.title = 'Title must be unique';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}