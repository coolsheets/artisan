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
    <div>
      <textarea 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        rows={4} 
        cols={60} 
        placeholder="Describe your project/problem..." 
      />
      <br />
      <div style={{ margin: '10px 0' }}>
        <button onClick={handleOptimize} disabled={loading}>
          {loading ? 'Processing...' : 'Generate & Optimize'}
        </button>
        <button 
          onClick={clearAll} 
          disabled={loading}
          style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>
      <button onClick={clearAll} style={{ marginLeft: '10px' }}>
        Clear
      </button>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {optimized && (
        <div>
          <h3>Optimized Prompt:</h3>
          <pre>{optimized}</pre>
        </div>
      )}
      {atomized.length > 0 && (
        <div>
          <h3>Atomized Prompts:</h3>
          <ul>
            {atomized.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
