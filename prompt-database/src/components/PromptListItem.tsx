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

interface PromptListItemProps {
  prompt: Prompt;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export function PromptListItem({ prompt, isSelected, onClick }: PromptListItemProps) {
  return (
    <div
      data-testid={`prompt-list-item-${prompt.id}`}
      onClick={() => onClick(prompt.id)}
      className={`
        grid grid-cols-4 gap-4 p-3 border rounded cursor-pointer transition-colors
        ${
          isSelected
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      <div className="font-medium text-gray-900">{prompt.title}</div>
      <div className="text-gray-600">{prompt.category}</div>
      <div className="text-sm text-gray-500">
        <div data-testid={`prompt-updated-at-${prompt.id}`}>
          {prompt.updatedAt.toLocaleDateString()}
        </div>
        <div data-testid={`prompt-created-at-${prompt.id}`} className="text-xs">
          Created: {prompt.createdAt.toLocaleDateString()}
        </div>
      </div>
      <div className="text-sm text-gray-500 truncate">{prompt.tags}</div>
    </div>
  );
}