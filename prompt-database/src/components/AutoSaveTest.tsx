import React, { useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToast } from '@/hooks/useToast';

interface TestData {
  title: string;
  content: string;
}

export function AutoSaveTest() {
  const [data, setData] = useState<TestData>({
    title: 'Test Title',
    content: 'Test Content'
  });

  const { isAutoSaving, lastSaved, forceSave } = useAutoSave({
    data,
    onSave: async (saveData: TestData) => {
      console.log('Saving data:', saveData);
      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Data saved successfully');
    },
    enabled: true,
    delay: 1000
  });

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Auto-Save Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title:</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Content:</label>
          <textarea
            value={data.content}
            onChange={(e) => setData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isAutoSaving && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Auto-saving...
              </span>
            )}
            {lastSaved && !isAutoSaving && (
              <span className="text-green-600">
                ✓ Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <button
            onClick={forceSave}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Force Save
          </button>
        </div>
      </div>
    </div>
  );
}