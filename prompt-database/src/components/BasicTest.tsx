import { useState } from 'react';

export function BasicTest() {
  const [count, setCount] = useState(0);
  
  console.log('BasicTest component is rendering');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>Basic Test - Count: {count}</h1>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click me: {count}
      </button>
      <div style={{ marginTop: '20px' }}>
        <p>✅ React hooks working</p>
        <p>✅ Event handlers working</p>
        <p>✅ State updates working</p>
      </div>
    </div>
  );
}