// Test the store import without @/ alias first
import { useAppStore } from '../store/promptStore';

export function StoreTestApp() {
  try {
    const store = useAppStore();
    
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Store Test App</h1>
        <p>✅ React is working</p>
        <p>✅ Store import successful</p>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h3>Store State:</h3>
          <ul>
            <li>Prompts count: {store.prompts.items?.size || 0}</li>
            <li>Selected ID: {store.prompts.selectedId || 'none'}</li>
            <li>Is Loading: {store.ui.isLoading ? 'yes' : 'no'}</li>
            <li>Error: {store.ui.error || 'none'}</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red', backgroundColor: '#ffe6e6', minHeight: '100vh' }}>
        <h1>Store Error:</h1>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}