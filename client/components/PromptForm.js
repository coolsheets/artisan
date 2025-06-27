import { useState } from 'react';

// Function to recommend AI models based on prompt content
const getAIModelRecommendation = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Code-related tasks
  if (lowerPrompt.includes('code') || lowerPrompt.includes('programming') || 
      lowerPrompt.includes('debug') || lowerPrompt.includes('algorithm') ||
      lowerPrompt.includes('function') || lowerPrompt.includes('script') ||
      lowerPrompt.includes('api') || lowerPrompt.includes('database')) {
    return {
      primary: 'Claude 3.5 Sonnet',
      secondary: 'GPT-4',
      reason: 'Excellent for code generation, debugging, and technical documentation'
    };
  }
  
  // Creative writing tasks
  if (lowerPrompt.includes('write') || lowerPrompt.includes('story') || 
      lowerPrompt.includes('creative') || lowerPrompt.includes('article') ||
      lowerPrompt.includes('content') || lowerPrompt.includes('blog')) {
    return {
      primary: 'GPT-4',
      secondary: 'Claude 3.5 Sonnet',
      reason: 'Superior creative writing and content generation capabilities'
    };
  }
  
  // Analysis and reasoning tasks
  if (lowerPrompt.includes('analyze') || lowerPrompt.includes('research') || 
      lowerPrompt.includes('explain') || lowerPrompt.includes('compare') ||
      lowerPrompt.includes('evaluate') || lowerPrompt.includes('strategy')) {
    return {
      primary: 'Claude 3.5 Sonnet',
      secondary: 'GPT-4',
      reason: 'Excellent analytical and reasoning capabilities with nuanced understanding'
    };
  }
  
  // Math and data tasks
  if (lowerPrompt.includes('math') || lowerPrompt.includes('calculate') || 
      lowerPrompt.includes('data') || lowerPrompt.includes('statistics') ||
      lowerPrompt.includes('formula') || lowerPrompt.includes('equation')) {
    return {
      primary: 'GPT-4',
      secondary: 'Claude 3.5 Sonnet',
      reason: 'Strong mathematical reasoning and data analysis capabilities'
    };
  }
  
  // Default recommendation
  return {
    primary: 'Claude 3.5 Sonnet',
    secondary: 'GPT-4',
    reason: 'Balanced performance across most tasks with excellent instruction following'
  };
};

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

  // Get AI model recommendation based on the input prompt
  const aiModelRecommendation = getAIModelRecommendation(input);

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
        gap: '15px',
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
            flex: '1 1 0',
            minWidth: '120px'
          }}
        >
          {loading ? 'Processing...' : 'Generate'}
        </button>
        <button 
          onClick={clearAll} 
          disabled={loading}
          style={{ 
            padding: 'clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            backgroundColor: '#6c757d',
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: '500',
            minHeight: '44px',
            flex: '1 1 0',
            minWidth: '120px'
          }}
        >
          Clear
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
      
      {/* AI Model Recommendation and Usage Instructions */}
      {optimized && (
        <div style={{
          margin: '20px 0',
          padding: 'clamp(12px, 2.5vw, 18px)',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffeaa7',
          borderRadius: '10px',
          borderLeft: '6px solid #f39c12'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: 'clamp(16px, 3vw, 18px)',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>💡</span> How to Use These Prompts
          </h3>
          
          <div style={{
            marginBottom: '20px',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.6',
            color: '#856404'
          }}>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong>📋 Copy the optimized prompt</strong> for single-step tasks, or use the 
              <strong> atomized prompts sequentially</strong> for complex multi-step processes.
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong>🔄 For atomized prompts:</strong> Send each step one at a time, wait for completion, 
              then proceed to the next step for best results.
            </p>
          </div>

          {(() => {
            const recommendation = getAIModelRecommendation(input);
            return (
              <div style={{
                backgroundColor: '#fff',
                padding: 'clamp(10px, 2vw, 15px)',
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}>
                <h4 style={{
                  margin: '0 0 10px 0',
                  fontSize: 'clamp(15px, 2.8vw, 17px)',
                  color: '#856404',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>🤖</span> Recommended AI Models
                </h4>
                <div style={{
                  fontSize: 'clamp(13px, 2.3vw, 15px)',
                  lineHeight: '1.5',
                  color: '#6c757d'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong style={{ color: '#007bff' }}>Primary: {recommendation.primary}</strong>
                    {recommendation.secondary && (
                      <span> • <strong style={{ color: '#28a745' }}>Alternative: {recommendation.secondary}</strong></span>
                    )}
                  </p>
                  <p style={{ margin: '0', fontStyle: 'italic' }}>
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
