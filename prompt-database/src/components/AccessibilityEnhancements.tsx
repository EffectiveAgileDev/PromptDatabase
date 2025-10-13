import React, { useEffect, useRef, useState } from 'react';

// Accessibility testing component for development
export function AccessibilityTester({ enabled = false }: { enabled?: boolean }) {
  const reportRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || import.meta.env.PROD) return;

    const runAxeTest = async () => {
      try {
        const axe = await import('axe-core');
        const results = await axe.default.run();
        
        if (results.violations.length > 0) {
          console.group('🚫 Accessibility Violations Found');
          results.violations.forEach((violation) => {
            console.error(`${violation.id}: ${violation.description}`);
            console.log('Impact:', violation.impact);
            console.log('Nodes:', violation.nodes.length);
            violation.nodes.forEach((node) => {
              console.log('Element:', node.target);
              console.log('Failure:', node.failureSummary);
            });
          });
          console.groupEnd();
        } else {
          console.log('✅ No accessibility violations found');
        }

        reportRef.current = results;
      } catch (error) {
        console.error('Accessibility test failed:', error);
      }
    };

    // Run test after component mounts and updates
    const timeoutId = setTimeout(runAxeTest, 1000);
    return () => clearTimeout(timeoutId);
  }, [enabled]);

  return null;
}

// Skip navigation component
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
}

// Screen reader announcements
export function ScreenReaderAnnouncement({ message, priority = 'polite' }: { 
  message: string; 
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Focus management hook
export function useFocusManagement() {
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  };

  const trapFocus = (containerSelector: string) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  };

  return { focusElement, trapFocus };
}

// Improved form labels and descriptions
export function FormField({ 
  id, 
  label, 
  description, 
  error, 
  required = false,
  children 
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label} 
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': ariaDescribedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          required
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// High contrast mode detection and toggle
export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
    document.documentElement.classList.toggle('high-contrast', !highContrast);
  };

  return { highContrast, toggleHighContrast };
}