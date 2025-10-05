import { ToastProvider } from '@/hooks/useToast';
import { CustomFieldsApp } from '@/components/CustomFieldsApp';

function App() {
  try {
    return (
      <ToastProvider>
        <CustomFieldsApp />
      </ToastProvider>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error Loading App</h1>
        <pre className="mt-4">{String(error)}</pre>
      </div>
    );
  }
}

export default App;
