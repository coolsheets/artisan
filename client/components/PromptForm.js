import { useState } from 'react';

export default function PromptForm({ onNewPrompt }) {
  const [input, setInput] = useState('');
  const [optimized, setOptimized] = useState('');
  const [atomized, setAtomized] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    // Call Next.js API routes for optimization and atomization
    const resOpt = await fetch('/api/optimize', { method: 'POST', body: JSON.stringify({ prompt: input }), headers: { 'Content-Type': 'application/json' } });
    const { optimized } = await resOpt.json();

    const resAtom = await fetch('/api/atomize', { method: 'POST', body: JSON.stringify({ prompt: input }), headers: { 'Content-Type': 'application/json' } });
    const { atomized } = await resAtom.json();

    setOptimized(optimized);
    setAtomized(atomized);
    setLoading(false);
    onNewPrompt({ original: input, optimized, atomized });
  };

  return (
    <div>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} cols={60} placeholder="Describe your project/problem..." />
      <br />
      <button onClick={handleOptimize} disabled={loading}>Generate & Optimize</button>
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
