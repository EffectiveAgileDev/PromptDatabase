import { ToastProvider } from '@/hooks/useToast';
import { CustomFieldsApp } from '@/components/CustomFieldsApp';

function App() {
  return (
    <ToastProvider>
      <CustomFieldsApp />
    </ToastProvider>
  );
}

export default App;
