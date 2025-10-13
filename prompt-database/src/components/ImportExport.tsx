import { useState, useCallback } from 'react';
import { usePromptStore } from '@/store/promptStore';
import { Dialog } from '@headlessui/react';
import { useToast } from '@/hooks/useToast';

interface ImportExportProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'csv';
type ImportStep = 'upload' | 'preview' | 'mapping' | 'processing';

interface ImportPreview {
  valid: any[];
  invalid: Array<{ data: any; errors: string[] }>;
  duplicates: any[];
}

export function ImportExport({ isOpen, onClose }: ImportExportProps) {
  const { prompts, customFields, addPrompt } = usePromptStore();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportScope, setExportScope] = useState<'all' | 'category' | 'dateRange'>('all');
  
  // Import state
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const handleExport = useCallback(() => {
    try {
      const dataToExport = prompts;
      
      // Apply scope filtering (simplified for demo)
      if (exportScope === 'category') {
        // Would filter by selected category
      }
      
      let exportData: any;
      let filename: string;
      let mimeType: string;
      
      if (exportFormat === 'json') {
        exportData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          customFields,
          prompts: dataToExport
        };
        filename = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV export
        const headers = ['id', 'title', 'promptText', 'category', 'tags', 'expectedOutput', 'notes', 'createdAt', 'updatedAt'];
        
        // Add custom field headers
        customFields.forEach((field: any) => {
          headers.push(`custom_${field.name}`);
        });
        
        const csvContent = [
          headers.join(','),
          ...dataToExport.map((prompt: any) => {
            const row = [
              `"${prompt.id || ''}"`,
              `"${(prompt.title || '').replace(/"/g, '""')}"`,
              `"${(prompt.promptText || '').replace(/"/g, '""')}"`,
              `"${prompt.category || ''}"`,
              `"${prompt.tags || ''}"`,
              `"${(prompt.expectedOutput || '').replace(/"/g, '""')}"`,
              `"${(prompt.notes || '').replace(/"/g, '""')}"`,
              `"${prompt.createdAt || ''}"`,
              `"${prompt.updatedAt || ''}"`
            ];
            
            // Add custom field values
            customFields.forEach((field: any) => {
              const value = prompt.customFields?.[field.id] || '';
              row.push(`"${String(value).replace(/"/g, '""')}"`);
            });
            
            return row.join(',');
          })
        ].join('\n');
        
        exportData = csvContent;
        filename = `prompts-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }
      
      // Create and download file
      const blob = new Blob([typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`Exported ${dataToExport.length} prompts to ${exportFormat.toUpperCase()}`, 'success');
      onClose();
    } catch (error) {
      showToast('Export failed: ' + String(error), 'error');
    }
  }, [prompts, customFields, exportFormat, exportScope, showToast, onClose]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStep('preview');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: any[];
        
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          parsedData = Array.isArray(jsonData) ? jsonData : jsonData.prompts || [];
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing (would use a proper CSV parser in production)
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.trim().replace(/^"|"$/g, '') || '';
            });
            return obj;
          });
        } else {
          throw new Error('Unsupported file format');
        }
        
        // Validate and categorize data
        const valid: any[] = [];
        const invalid: Array<{ data: any; errors: string[] }> = [];
        const duplicates: any[] = [];
        
        parsedData.forEach(item => {
          const errors: string[] = [];
          
          if (!item.title) errors.push('Missing title');
          if (prompts.some((p: any) => p.title === item.title)) {
            duplicates.push(item);
          }
          
          if (errors.length > 0) {
            invalid.push({ data: item, errors });
          } else {
            valid.push(item);
          }
        });
        
        setImportPreview({ valid, invalid, duplicates });
      } catch (error) {
        showToast('Failed to parse file: ' + String(error), 'error');
        setImportStep('upload');
      }
    };
    
    reader.readAsText(file);
  }, [prompts, showToast]);

  const handleImport = useCallback(() => {
    if (!importPreview) return;

    setImportStep('processing');
    
    try {
      let importCount = 0;
      
      for (const prompt of importPreview.valid) {
        // Add basic validation and transformation
        const promptData = {
          title: prompt.title,
          promptText: prompt.promptText || prompt.content || '',
          category: prompt.category || '',
          tags: prompt.tags || '',
          expectedOutput: prompt.expectedOutput || '',
          notes: prompt.notes || ''
        };
        
        addPrompt(promptData);
        importCount++;
      }
      
      showToast(`Successfully imported ${importCount} prompts`, 'success');
      onClose();
      setImportStep('upload');
      setImportPreview(null);
    } catch (error) {
      showToast('Import failed: ' + String(error), 'error');
    }
  }, [importPreview, addPrompt, showToast, onClose]);

  const resetImport = () => {
    setImportStep('upload');
    setImportPreview(null);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">Import / Export</Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📤 Export Prompts
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📥 Import Prompts
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'export' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Export Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Format
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="format"
                            value="json"
                            checked={exportFormat === 'json'}
                            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                            className="mr-2"
                          />
                          JSON (Recommended)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="format"
                            value="csv"
                            checked={exportFormat === 'csv'}
                            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                            className="mr-2"
                          />
                          CSV (Spreadsheet)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Scope
                      </label>
                      <select
                        value={exportScope}
                        onChange={(e) => setExportScope(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Prompts ({prompts.length})</option>
                        <option value="category">Selected Category</option>
                        <option value="dateRange">Date Range</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Export Preview</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {prompts.length} prompts will be exported</li>
                      <li>• {customFields.length} custom fields included</li>
                      <li>• Format: {exportFormat.toUpperCase()}</li>
                      <li>• File size: ~{Math.round(JSON.stringify(prompts).length / 1024)}KB</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleExport}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    📥 Download Export
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {importStep === 'upload' && (
                  <div className="text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Import Prompts
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upload a JSON or CSV file containing your prompts
                      </p>
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: JSON, CSV (max 10MB)
                      </p>
                    </div>
                  </div>
                )}

                {importStep === 'preview' && importPreview && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Import Preview</h3>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {importPreview.valid.length}
                        </div>
                        <div className="text-sm text-green-800">Valid</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {importPreview.duplicates.length}
                        </div>
                        <div className="text-sm text-yellow-800">Duplicates</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {importPreview.invalid.length}
                        </div>
                        <div className="text-sm text-red-800">Invalid</div>
                      </div>
                    </div>

                    {importPreview.invalid.length > 0 && (
                      <div className="border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Issues Found</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {importPreview.invalid.slice(0, 5).map((item, index) => (
                            <div key={index} className="text-sm text-red-700">
                              <strong>{item.data.title || 'Untitled'}</strong>: {item.errors.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleImport}
                        disabled={importPreview.valid.length === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Import {importPreview.valid.length} Valid Prompts
                      </button>
                      <button
                        onClick={resetImport}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {importStep === 'processing' && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium">Importing Prompts...</h3>
                    <p className="text-gray-600">Please wait while we process your file</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}