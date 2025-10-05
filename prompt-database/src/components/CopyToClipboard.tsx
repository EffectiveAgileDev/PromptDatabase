import React, { useState, useCallback } from 'react';

interface CopyToClipboardProps {
  text: string;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  buttonText?: string;
  formatter?: (text: string) => string;
}

type CopyState = 'idle' | 'loading' | 'success' | 'error';

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  onCopy,
  onError,
  buttonText = 'Copy to Clipboard',
  formatter,
}) => {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [showFallback, setShowFallback] = useState(false);

  const copyToClipboard = useCallback(async () => {
    const textToCopy = formatter ? formatter(text) : text;
    
    setCopyState('loading');
    
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setCopyState('success');
        onCopy?.(textToCopy);
        
        // Reset state after 2 seconds
        setTimeout(() => {
          setCopyState('idle');
        }, 2000);
      } else {
        // Fallback for browsers without clipboard API
        setShowFallback(true);
        setCopyState('idle');
      }
    } catch (error) {
      setCopyState('error');
      onError?.(error as Error);
      
      // Reset error state after 2 seconds
      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    }
  }, [text, formatter, onCopy, onError]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      copyToClipboard();
    }
  }, [copyToClipboard]);

  const selectAllText = useCallback(() => {
    const textArea = document.getElementById('fallback-text') as HTMLTextAreaElement;
    if (textArea) {
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices
    }
  }, []);

  const renderIcon = () => {
    switch (copyState) {
      case 'loading':
        return (
          <svg
            data-testid="loading-icon"
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        );
      case 'success':
        return (
          <svg
            data-testid="success-icon"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        );
      case 'error':
        return (
          <svg
            data-testid="error-icon"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg
            data-testid="copy-icon"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        );
    }
  };

  const getButtonColor = () => {
    switch (copyState) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'loading':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
    }
  };

  if (showFallback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Copy Manually</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please select the text below and copy it manually (Ctrl+C or Cmd+C):
          </p>
          <textarea
            id="fallback-text"
            value={formatter ? formatter(text) : text}
            readOnly
            className="w-full h-32 p-3 border border-gray-300 rounded resize-none font-mono text-sm"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={selectAllText}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select All
            </button>
            <button
              onClick={() => setShowFallback(false)}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={copyToClipboard}
        onKeyDown={handleKeyDown}
        aria-label="Copy to clipboard"
        type="button"
        disabled={copyState === 'loading'}
        className={`
          inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getButtonColor()}
        `}
        title="Copy prompt to clipboard"
      >
        {renderIcon()}
        <span className="hidden sm:inline">{buttonText}</span>
      </button>
    </div>
  );
};