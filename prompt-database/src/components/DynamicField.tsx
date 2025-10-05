import React from 'react';
import type { CustomField } from './FieldManager';

interface DynamicFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  className = ''
}) => {
  const baseInputClass = `w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`;

  switch (field.type) {
    case 'text':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
            {field.name}
          </label>
          <input
            id={field.id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
            {field.name}
          </label>
          <input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.valueAsNumber || null)}
            className={baseInputClass}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
            {field.name}
          </label>
          <textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClass} min-h-[100px] resize-y`}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
            {field.name}
          </label>
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
};