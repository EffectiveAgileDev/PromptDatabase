import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { performanceMonitor } from './utils/performance'

// Initialize performance monitoring
if (import.meta.env.PROD) {
  // Report performance metrics after app loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      const report = performanceMonitor.generateReport();
      console.log('📊 Performance Report:', report);
    }, 1000);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
