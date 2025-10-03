export interface Prompt {
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

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface AppSettings {
  itemsPerPage: number;
  defaultSortField: keyof Prompt;
  defaultSortDirection: 'asc' | 'desc';
  theme: 'light' | 'dark' | 'system';
}