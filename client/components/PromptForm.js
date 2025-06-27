import { useState } from 'react';

export default function PromptForm({ onNewPrompt, onClearAll }) {
  const [input, setInput] = useState('');
  const [optimized, setOptimized] = useState('');
  const [atomized, setAtomized] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    if (!input.trim()) {
      setError('Please enter a prompt to optimize');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Call Next.js API routes for optimization and atomization
      const resOpt = await fetch('/api/optimize', { 
        method: 'POST', 
        body: JSON.stringify({ prompt: input }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (!resOpt.ok) {
        throw new Error(`Optimization failed: ${resOpt.status}`);
      }
      
      const { optimized } = await resOpt.json();

      const resAtom = await fetch('/api/atomize', { 
        method: 'POST', 
        body: JSON.stringify({ prompt: input }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (!resAtom.ok) {
        throw new Error(`Atomization failed: ${resAtom.status}`);
      }
      
      const { atomized } = await resAtom.json();

      setOptimized(optimized);
      setAtomized(atomized);
      onNewPrompt({ original: input, optimized, atomized });
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInput('');
    setOptimized('');
    setAtomized([]);
    setError('');
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <textarea 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        rows={4}
        placeholder="Describe your project/problem..." 
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: 'clamp(8px, 1.5vw, 12px)',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          border: '1px solid #ccc',
          borderRadius: '8px',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: '1.4'
        }}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '15px 0',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={handleOptimize} 
          disabled={loading}
          style={{
            padding: 'clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: '500',
            minHeight: '44px',
            flex: '1 1 auto'
          }}
        >
          {loading ? 'Processing...' : 'Generate & Optimize'}
        </button>
        <button 
          onClick={clearAll} 
          disabled={loading}
          style={{ 
            padding: 'clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            backgroundColor: '#000000',
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: '500',
            minHeight: '44px',
            flexShrink: 0
          }}
        >
          Clear All
        </button>
      </div>
      
      {error && (
        <div style={{ 
          color: '#dc3545', 
          margin: '15px 0',
          padding: 'clamp(10px, 2vw, 15px)',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontSize: 'clamp(14px, 2.5vw, 16px)'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {optimized && (
        <div style={{
          margin: '20px 0',
          padding: 'clamp(10px, 2vw, 15px)',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px'
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: 'clamp(16px, 3vw, 18px)',
            color: '#155724'
          }}>
            Optimized Prompt:
          </h3>
          <pre style={{
            margin: 0,
            padding: 'clamp(8px, 1.5vw, 12px)',
            backgroundColor: '#ffffff',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            fontSize: 'clamp(13px, 2.5vw, 14px)',
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'auto'
          }}>
            {optimized}
          </pre>
        </div>
      )}
      
      {atomized.length > 0 && (
        <div style={{
          margin: '20px 0',
          padding: 'clamp(10px, 2vw, 15px)',
          backgroundColor: '#cce7ff',
          border: '1px solid #99d3ff',
          borderRadius: '8px'
        }}>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: 'clamp(16px, 3vw, 18px)',
            color: '#004085'
          }}>
            Atomized Prompts:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: 'clamp(16px, 3vw, 20px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.5'
          }}>
            {atomized.map((a, i) => (
              <li key={i} style={{ 
                marginBottom: '8px',
                wordWrap: 'break-word'
              }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
