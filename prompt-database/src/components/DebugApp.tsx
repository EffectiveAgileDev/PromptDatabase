export function DebugApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Debug App</h1>
      <p>✅ React is working</p>
      <p>✅ Component is rendering</p>
      <p>✅ No imports causing issues</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h3>Next: Test store import</h3>
        <p>If you see this, the basic component works. The issue is likely with our store or path aliases.</p>
      </div>
    </div>
  );
}