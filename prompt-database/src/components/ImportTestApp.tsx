export function ImportTestApp() {
  // Just test basic imports first
  let importStatus = '';
  
  try {
    // Test if we can import zustand
    const zustand = require('zustand');
    importStatus += '✅ Zustand imported\n';
  } catch (e) {
    importStatus += '❌ Zustand failed: ' + e + '\n';
  }

  try {
    // Test if we can import the types
    const types = require('../types/prompt');
    importStatus += '✅ Types imported\n';
  } catch (e) {
    importStatus += '❌ Types failed: ' + e + '\n';
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Import Test</h1>
      <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
        {importStatus}
      </pre>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
        <p>If you see checkmarks above, the basic imports work. If you see X marks, there's an import issue.</p>
      </div>
    </div>
  );
}