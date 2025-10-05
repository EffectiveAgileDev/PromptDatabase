export type FieldType = 'text' | 'number' | 'select' | 'textarea';

export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
}