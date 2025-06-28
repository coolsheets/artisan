import { useState, useEffect, createContext, useRef } from 'react';
import PromptForm from '../components/PromptForm';
import PromptList from '../components/PromptList';

// Create theme context for light/dark mode
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [showDescription, setShowDescription] = useState(false); // Always hidden by default
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [themeTransition, setThemeTransition] = useState(false);
  const descriptionRef = useRef(null);
  const infoButtonRef = useRef(null);
  
  // Close info popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showDescription && 
          descriptionRef.current && 
          infoButtonRef.current &&
          !descriptionRef.current.contains(event.target) &&
          !infoButtonRef.current.contains(event.target)) {
        setShowDescription(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDescription]);
  
  // Theme toggle handler with transition
  const toggleTheme = () => {
    // Enable transitions
    setThemeTransition(true);
    
    // Update theme after a short delay to ensure transitions are enabled
    setTimeout(() => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      
      // Save theme preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('artisan-theme', newTheme);
        
        // Apply theme to document for global styling
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    }, 10);
  };
  
  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('artisan-theme');
      let initialTheme = 'light';
      
      if (savedTheme) {
        initialTheme = savedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference as default if no saved preference
        initialTheme = 'dark';
      }
      
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);
  
  // Add listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only change if user hasn't manually set a preference
      if (!localStorage.getItem('artisan-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };
    
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery?.addListener) {
      // For older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
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
      // Never show description automatically
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Generate theme-based style variables
  const themeStyles = {
    light: {
      background: '#ffffff',
      text: '#343a40',
      secondaryText: '#6c757d',
      border: '#dee2e6',
      cardBg: '#f8f9fa',
      primary: '#0d6efd',
      primaryHover: '#0b5ed7',
      success: '#198754',
      info: '#0dcaf0', 
      accent: '#6f42c1'
    },
    dark: {
      background: '#212529',
      text: '#f8f9fa',
      secondaryText: '#adb5bd',
      border: '#495057',
      cardBg: '#343a40',
      primary: '#0d6efd',
      primaryHover: '#0b5ed7',
      success: '#198754',
      info: '#0dcaf0',
      accent: '#6f42c1'
    }
  };
  
  const currentTheme = themeStyles[theme];
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Backdrop overlay for modal */}
      {showDescription && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            transition: 'opacity 0.3s ease',
          }}
          onClick={() => setShowDescription(false)}
          aria-hidden="true"
        />
      )}
      
      <div style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto',
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        {/* Theme toggle button */}
        <button
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'transparent',
            border: 'none',
            color: currentTheme.text,
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <header style={{
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${currentTheme.border}`,
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            marginBottom: '20px',
            textAlign: 'center',
            background: `linear-gradient(90deg, ${currentTheme.primary} 0%, ${currentTheme.accent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
          }}>
            Artisan
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            marginBottom: '20px',
            textAlign: 'center',
            color: currentTheme.secondaryText
      }}>
            AI Prompt Generator
          </h2>
        </header>
      
        <div style={{ 
          position: 'relative',
          marginBottom: '30px'
        }}>

          {/* Description popup */}
          <div 
            id="app-description"
            ref={descriptionRef}
            style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              lineHeight: '1.6', 
              color: currentTheme.secondaryText, 
              backgroundColor: currentTheme.cardBg,
              padding: 'clamp(20px, 3vw, 30px)',
              borderRadius: '12px',
              border: `1px solid ${currentTheme.border}`,
              boxSizing: 'border-box',
              textAlign: 'left',
              opacity: showDescription ? 1 : 0,
              visibility: showDescription ? 'visible' : 'hidden',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: showDescription ? 'translate(-50%, -50%)' : 'translate(-50%, -60%)',
              transition: 'all 0.3s ease-in-out',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              zIndex: 100,
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            tabIndex={showDescription ? 0 : -1}
            role="dialog"
            aria-modal="true"
            aria-label="Application description"
          >
            {/* Close button */}
            <button
              onClick={() => setShowDescription(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: currentTheme.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${currentTheme.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              aria-label="Close info popup"
            >
              ✕
            </button>
            
            <h3 style={{ marginTop: 0, color: currentTheme.text, fontWeight: '600' }}>About Artisan Prompt Generator</h3>
            
            <p style={{ marginTop: '15px' }}>
              <span role="img" aria-label="sparkles" style={{ fontSize: '1.2em', marginRight: '5px' }}>✨</span> 
              This application helps you create optimized AI prompts for maximum effectiveness and minimal token usage.
            </p>
            <p>
              Enter your project description or problem statement, and get both a concise optimized version and 
              step-by-step atomized prompts for complex tasks. Perfect for developers, writers, and AI enthusiasts 
              who want to craft better prompts for ChatGPT, Claude, and other AI systems.
            </p>
            <p style={{ marginBottom: 0, fontSize: '0.9em' }}>
              <span role="img" aria-label="camera" style={{ marginRight: '5px' }}>📷</span>
              You can also upload images for visual context-aware prompts!
            </p>
          </div>
        </div>
        
        <PromptForm 
          onNewPrompt={handleNewPrompt} 
          onClearAll={clearAllPrompts}
          onToggleInfo={() => setShowDescription(!showDescription)}
          theme={theme} 
        />
        <PromptList prompts={prompts} theme={theme} />
      </div>
    </ThemeContext.Provider>
  );
}
