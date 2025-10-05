import React from 'react';
import { ToastProvider } from '@/hooks/useToast';
import { EnhancedMainApp } from './EnhancedMainApp';

export function MainAppWithToast() {
  return (
    <ToastProvider>
      <EnhancedMainApp />
    </ToastProvider>
  );
}