import { ToastProvider } from './hooks/useToast';
import { MainApp } from './components/MainApp';

function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;
