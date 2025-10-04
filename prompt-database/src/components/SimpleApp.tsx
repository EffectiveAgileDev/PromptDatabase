import { useAppStore } from '@/store/promptStore';

export function SimpleApp() {
  try {
    const { prompts, ui } = useAppStore();
    
    return (
      <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Prompt Database</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>Debug Info:</strong>
          <ul>
            <li>Prompts count: {prompts.items?.size || 0}</li>
            <li>Selected ID: {prompts.selectedId || 'none'}</li>
            <li>Is Loading: {ui.isLoading ? 'yes' : 'no'}</li>
            <li>Error: {ui.error || 'none'}</li>
          </ul>
        </div>

        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Store state:', useAppStore.getState())}
        >
          Log Store State
        </button>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error loading app:</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}