import { useState, useEffect } from 'react';
import PromptForm from '../components/PromptForm';
import PromptList from '../components/PromptList';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const handleNewPrompt = (prompt) => {
    setPrompts([prompt, ...prompts]);
  };
  
  const clearAllPrompts = () => {
    setPrompts([]);
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowDescription(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Artisan
      </h1>
      <h2 style={{
        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        AI Prompt Generator
      </h2>
      
      <div style={{ 
        position: 'relative',
        marginBottom: '30px'
      }}>
        {/* Mobile info button */}
        {isMobile && (
          <button
            style={{
              display: 'block',
              margin: '0 auto 15px auto',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: showDescription ? '#007bff' : 'transparent',
              border: '1px solid #007bff',
              borderRadius: '20px',
              color: showDescription ? 'white' : '#007bff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setShowDescription(!showDescription)}
            onMouseEnter={(e) => {
              if (!showDescription) {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!showDescription) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#007bff';
              }
            }}
          >
            {showDescription ? '✕ Hide Info' : 'ℹ️ Show Info'}
          </button>
        )}

        {/* Description paragraph */}
        <div 
          style={{ 
            fontSize: 'clamp(14px, 2.5vw, 16px)', 
            lineHeight: '1.5', 
            color: '#666', 
            backgroundColor: '#f8f9fa',
            padding: 'clamp(10px, 2vw, 15px)',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            opacity: isMobile ? (showDescription ? 1 : 0) : 1,
            maxHeight: isMobile ? (showDescription ? '200px' : '0') : 'none',
            overflow: 'hidden',
            transform: isMobile ? (showDescription ? 'translateY(0)' : 'translateY(-10px)') : 'translateY(0)',
            transition: 'all 0.3s ease-in-out',
            marginBottom: isMobile && !showDescription ? '0' : '15px'
          }}
          tabIndex={isMobile ? -1 : 0}
          role="region"
          aria-label="Application description"
        >
          This application helps you create optimized AI prompts for maximum effectiveness and minimal token usage. 
          Enter your project description or problem statement, and get both a concise optimized version and 
          step-by-step atomized prompts for complex tasks. Perfect for developers, writers, and AI enthusiasts 
          who want to craft better prompts for ChatGPT, Claude, and other AI systems.
        </div>
      </div>
      
      <PromptForm 
        onNewPrompt={handleNewPrompt} 
        onClearAll={clearAllPrompts}
      />
      <PromptList prompts={prompts} />
    </div>
  );
}
