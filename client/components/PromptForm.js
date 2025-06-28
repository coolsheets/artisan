import { useState } from 'react';
import { generatePreamble, generateConcisePreamble, analyzeProblemType, estimateTokens } from '../utils/preambleGenerator';
import ImageUpload from './ImageUpload';

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
  const [preamble, setPreamble] = useState('');
  const [problemAnalysis, setProblemAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState(null);

  const handleOptimize = async () => {
    if (!input.trim()) {
      setError('Please enter a prompt to optimize');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Analyze the problem and generate preamble
      const analysis = analyzeProblemType(input);
      setProblemAnalysis(analysis);
      
      // Get AI model recommendation
      const modelRec = getAIModelRecommendation(input);
      const primaryModel = modelRec.primary.toLowerCase().includes('claude') ? 'claude' : 
                          modelRec.primary.toLowerCase().includes('gpt') ? 'gpt-4' : 'generic';
      
      // Generate appropriate preamble
      const generatedPreamble = analysis.complexity <= 3 ? 
        generateConcisePreamble(input, primaryModel) : 
        generatePreamble(input, primaryModel);
      setPreamble(generatedPreamble);

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
      onNewPrompt({ 
        original: input, 
        optimized, 
        atomized, 
        preamble, 
        analysis: problemAnalysis,
        imageAnalysis: imageAnalysis
      });
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
    setPreamble('');
    setProblemAnalysis(null);
    setImageAnalysis(null);
    setPromptSuggestions(null);
    setError('');
    if (onClearAll) {
      onClearAll();
    }
  };
  
  // Handle image analysis results
  const handleImageAnalysis = (data) => {
    setImageAnalysis(data);
    
    // Get prompt suggestions
    if (data.analysis && data.analysis.content) {
      // Extract prompt suggestions
      const suggestions = data.promptSuggestions || {
        contextPrompt: `I'm working with a ${data.analysis.technical.width}×${data.analysis.technical.height} image that appears to show ${data.analysis.content.possibleSubjects.join(', ')}.`,
        combined: `Using the uploaded image (${data.analysis.technical.format}, ${data.analysis.content.colorTone} tones, ${data.analysis.content.brightness} lighting), enhance my prompt:`
      };
      
      setPromptSuggestions(suggestions);
      
      // Pre-fill the input with contextual prompt
      if (suggestions.contextPrompt && !input) {
        setInput(suggestions.contextPrompt);
      }
    }
    
    setError('');
  };
  
  // Toggle image upload section
  const toggleImageUpload = () => {
    setShowImageUpload(!showImageUpload);
  };

  // Get AI model recommendation based on the input prompt
  const aiModelRecommendation = getAIModelRecommendation(input);

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <button
          onClick={toggleImageUpload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: showImageUpload ? '#007bff' : 'transparent',
            border: '1px solid #007bff',
            borderRadius: '20px',
            color: showImageUpload ? 'white' : '#007bff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span role="img" aria-label="camera">📷</span>
          {showImageUpload ? 'Hide Image Upload' : 'Add Image'}
        </button>
        
        {promptSuggestions && (
          <div style={{
            fontSize: '14px',
            color: '#6c757d',
          }}>
            <span>Image detected: </span>
            <strong style={{ color: '#007bff' }}>
              {imageAnalysis?.analysis?.content?.possibleSubjects?.slice(0, 2).join(', ')}
            </strong>
          </div>
        )}
      </div>
      
      {showImageUpload && (
        <ImageUpload 
          onImageAnalysis={handleImageAnalysis}
          onError={(msg) => setError(msg)}
        />
      )}
      
      {promptSuggestions && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#e9f7fe',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Suggested Prompts:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {Object.entries(promptSuggestions).map(([key, value]) => (
              <div 
                key={key}
                onClick={() => setInput(value)}
                style={{
                  padding: '5px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(0,123,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.5)';
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      )}

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
      
      {/* One-Shot Solution Preamble */}
      {preamble && (
        <div style={{
          margin: '20px 0',
          padding: 'clamp(10px, 2vw, 15px)',
          backgroundColor: '#e8f4fd',
          border: '2px solid #b3d4fc',
          borderRadius: '10px',
          borderLeft: '6px solid #007bff'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#004085',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🎯</span> One-Shot Solution Preamble
            </h3>
            <div style={{
              fontSize: 'clamp(11px, 2vw, 13px)',
              color: '#6c757d',
              display: 'flex',
              gap: '10px'
            }}>
              {problemAnalysis && (
                <>
                  <span>Type: <strong>{problemAnalysis.type}</strong></span>
                  <span>Complexity: <strong>{problemAnalysis.complexity}/10</strong></span>
                  <span>Tokens: <strong>~{estimateTokens(preamble)}</strong></span>
                </>
              )}
            </div>
          </div>
          
          <div style={{
            marginBottom: '15px',
            fontSize: 'clamp(13px, 2.3vw, 15px)',
            lineHeight: '1.5',
            color: '#004085'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              This comprehensive preamble provides the AI with specific instructions for delivering a 
              complete, production-ready solution in a single response.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: 'clamp(8px, 1.5vw, 12px)',
            borderRadius: '6px',
            border: '1px solid #b3d4fc',
            maxHeight: '300px',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => navigator.clipboard.writeText(preamble)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: 1
              }}
              title="Copy preamble to clipboard"
            >
              📋 Copy
            </button>
            <pre style={{
              margin: 0,
              fontSize: 'clamp(11px, 2vw, 13px)',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: '#212529',
              paddingRight: '60px' // Space for copy button
            }}>
              {preamble}
            </pre>
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.2vw, 14px)',
            color: '#0c5460'
          }}>
            <strong>💡 Usage:</strong> Copy this preamble and paste it before your original prompt when 
            sending to your chosen AI model for optimal results.
          </div>
        </div>
      )}
      
      {/* Image Analysis Results */}
      {imageAnalysis && (
        <div style={{
          margin: '20px 0',
          padding: 'clamp(10px, 2vw, 15px)',
          backgroundColor: '#f0f7ed',
          border: '2px solid #c3e6cb',
          borderRadius: '10px',
          borderLeft: '6px solid #28a745'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#155724',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🖼️</span> Image Analysis Results
            </h3>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ 
              flex: '1 1 200px',
              minWidth: '200px'
            }}>
              {imageAnalysis.fileInfo && (
                <img 
                  src={`/uploads/${imageAnalysis.fileInfo.filename}`}
                  alt="Analyzed image" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '1px solid #c3e6cb'
                  }}
                />
              )}
            </div>
            
            <div style={{ 
              flex: '2 1 300px',
              fontSize: 'clamp(13px, 2.3vw, 15px)',
            }}>
              <h4 style={{ 
                fontSize: 'clamp(14px, 2.7vw, 16px)',
                margin: '0 0 10px 0',
                color: '#155724'
              }}>
                Content Analysis
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  padding: '8px',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  borderRadius: '5px',
                }}>
                  <strong>Scene type:</strong> {imageAnalysis.analysis.content.likelyScene}
                </div>
                <div style={{ 
                  padding: '8px',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  borderRadius: '5px',
                }}>
                  <strong>Brightness:</strong> {imageAnalysis.analysis.content.brightness}
                </div>
                <div style={{ 
                  padding: '8px',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  borderRadius: '5px',
                }}>
                  <strong>Color tone:</strong> {imageAnalysis.analysis.content.colorTone}
                </div>
              </div>
              
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #c3e6cb',
              }}>
                <strong>Likely subjects:</strong> {imageAnalysis.analysis.content.possibleSubjects.join(', ')}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '8px 12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.2vw, 14px)',
            color: '#155724'
          }}>
            <strong>💡 TIP:</strong> Use the image analysis details above to craft more specific prompts. 
            Click on any suggested prompt to use it as a starting point.
          </div>
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
