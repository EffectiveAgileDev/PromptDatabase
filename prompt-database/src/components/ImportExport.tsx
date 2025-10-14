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
  headers?: string[];
  rawData?: any[];
}

interface FieldMapping {
  [csvColumn: string]: string; // Maps CSV column to Prompt field
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
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: any[];
        let headers: string[] = [];

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          parsedData = Array.isArray(jsonData) ? jsonData : jsonData.prompts || [];

          // For JSON, skip directly to preview since fields should match
          setImportStep('preview');
          validateAndPreview(parsedData);
        } else if (file.name.endsWith('.csv')) {
          // Proper CSV parsing that handles quoted fields with commas
          const lines = content.split('\n').filter(line => line.trim());

          // Parse CSV line respecting quoted fields
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              const nextChar = line[i + 1];

              if (char === '"') {
                if (inQuotes && nextChar === '"') {
                  // Escaped quote
                  current += '"';
                  i++; // Skip next quote
                } else {
                  // Toggle quote state
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                // Field separator
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          headers = parseCSVLine(lines[0]);
          parsedData = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });

          // Store headers and raw data for mapping step
          setParsedHeaders(headers);
          setImportPreview({
            valid: [],
            invalid: [],
            duplicates: [],
            headers,
            rawData: parsedData
          });

          // Initialize smart field mapping
          const autoMapping: FieldMapping = {};
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase().trim();
            // Smart auto-mapping based on common patterns
            if (lowerHeader === 'title' || lowerHeader === 'name') {
              autoMapping[header] = 'title';
            } else if (lowerHeader.includes('prompt') && lowerHeader.includes('text')) {
              autoMapping[header] = 'promptText';
            } else if (lowerHeader === 'category') {
              autoMapping[header] = 'category';
            } else if (lowerHeader === 'tags') {
              autoMapping[header] = 'tags';
            } else if (lowerHeader.includes('expected') && lowerHeader.includes('output')) {
              autoMapping[header] = 'expectedOutput';
            } else if (lowerHeader === 'notes') {
              autoMapping[header] = 'notes';
            } else {
              autoMapping[header] = ''; // Unmapped
            }
          });

          setFieldMapping(autoMapping);
          setImportStep('mapping');
        } else {
          throw new Error('Unsupported file format');
        }
      } catch (error) {
        showToast('Failed to parse file: ' + String(error), 'error');
        setImportStep('upload');
      }
    };

    reader.readAsText(file);

    function validateAndPreview(data: any[]) {
      const valid: any[] = [];
      const invalid: Array<{ data: any; errors: string[] }> = [];
      const duplicates: any[] = [];

      data.forEach(item => {
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
    }
  }, [prompts, showToast]);

  const handleMappingComplete = useCallback(() => {
    if (!importPreview?.rawData) return;

    // Apply field mappings to raw data
    const mappedData = importPreview.rawData.map(row => {
      const mappedRow: any = {};

      Object.entries(fieldMapping).forEach(([csvColumn, promptField]) => {
        if (promptField && row[csvColumn] !== undefined) {
          let value = row[csvColumn];
          // Limit promptText to 4000 characters
          if (promptField === 'promptText' && typeof value === 'string' && value.length > 4000) {
            value = value.substring(0, 4000);
          }
          mappedRow[promptField] = value;
        }
      });

      return mappedRow;
    });

    // Validate mapped data
    const valid: any[] = [];
    const invalid: Array<{ data: any; errors: string[] }> = [];
    const duplicates: any[] = [];

    mappedData.forEach(item => {
      const errors: string[] = [];

      if (!item.title) errors.push('Missing title (required field not mapped)');
      if (item.title && prompts.some((p: any) => p.title === item.title)) {
        duplicates.push(item);
      }

      if (errors.length > 0) {
        invalid.push({ data: item, errors });
      } else {
        valid.push(item);
      }
    });

    setImportPreview({ valid, invalid, duplicates });
    setImportStep('preview');
  }, [importPreview, fieldMapping, prompts]);

  const handleImport = useCallback(() => {
    if (!importPreview) return;

    setImportStep('processing');

    try {
      let importCount = 0;

      for (const prompt of importPreview.valid) {
        addPrompt(prompt);
        importCount++;
      }

      showToast(`Successfully imported ${importCount} prompts`, 'success');
      onClose();
      setImportStep('upload');
      setImportPreview(null);
      setFieldMapping({});
      setParsedHeaders([]);
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

                {importStep === 'mapping' && importPreview && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Map CSV Columns to Fields</h3>
                    <p className="text-sm text-gray-600">
                      Map your CSV columns to prompt fields. Fields marked with * are required.
                    </p>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700">
                          <div>CSV Column</div>
                          <div>Maps to Prompt Field</div>
                        </div>
                      </div>

                      <div className="divide-y max-h-64 overflow-y-auto">
                        {parsedHeaders.map((header, index) => (
                          <div key={index} className="px-4 py-3 hover:bg-gray-50">
                            <div className="grid grid-cols-2 gap-4 items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {header}
                                {importPreview.rawData && importPreview.rawData[0] && (
                                  <div className="text-xs text-gray-500 mt-1 truncate">
                                    Example: {importPreview.rawData[0][header]?.substring(0, 40)}
                                    {importPreview.rawData[0][header]?.length > 40 ? '...' : ''}
                                  </div>
                                )}
                              </div>
                              <div>
                                <select
                                  value={fieldMapping[header] || ''}
                                  onChange={(e) => setFieldMapping({
                                    ...fieldMapping,
                                    [header]: e.target.value
                                  })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Skip this column</option>
                                  <option value="title">Title *</option>
                                  <option value="promptText">Prompt Text</option>
                                  <option value="category">Category</option>
                                  <option value="tags">Tags</option>
                                  <option value="expectedOutput">Expected Output</option>
                                  <option value="notes">Notes</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-800">Mapping Tips</h4>
                          <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                            <li>• Title field is required - at least one column must map to it</li>
                            <li>• Unmapped columns will be ignored during import</li>
                            <li>• We've auto-detected some mappings based on column names</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleMappingComplete}
                        disabled={!Object.values(fieldMapping).includes('title')}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Continue to Preview
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