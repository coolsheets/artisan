import { useState, useEffect, createContext } from 'react';
import PromptForm from '../components/PromptForm';
import PromptList from '../components/PromptList';

// Create theme context for light/dark mode
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [themeTransition, setThemeTransition] = useState(false);
  
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
      if (!mobile) {
        setShowDescription(true);
      }
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
          {/* Mobile info button */}
          {isMobile && (
            <button
              aria-expanded={showDescription ? "true" : "false"}
              aria-controls="app-description"
              style={{
                display: 'block',
                margin: '0 auto 15px auto',
                padding: '12px 20px',
                fontSize: '14px',
                backgroundColor: showDescription ? currentTheme.primary : 'transparent',
                border: `1px solid ${currentTheme.primary}`,
                borderRadius: '24px',
                color: showDescription ? 'white' : currentTheme.primary,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                boxShadow: showDescription ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setShowDescription(!showDescription)}
              onMouseEnter={(e) => {
                if (!showDescription) {
                  e.target.style.backgroundColor = currentTheme.primaryHover;
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!showDescription) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = currentTheme.primary;
                }
              }}
            >
              {showDescription ? '✕ Hide Info' : 'ℹ️ Show Info'}
            </button>
          )}

          {/* Description paragraph */}
          <div 
            id="app-description"
            style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              lineHeight: '1.6', 
              color: currentTheme.secondaryText, 
              backgroundColor: currentTheme.cardBg,
              padding: 'clamp(15px, 2.5vw, 25px)',
              borderRadius: '12px',
              border: `1px solid ${currentTheme.border}`,
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
              opacity: isMobile ? (showDescription ? 1 : 0) : 1,
              maxHeight: isMobile ? (showDescription ? '300px' : '0') : 'none',
              overflow: 'hidden',
              transform: isMobile ? (showDescription ? 'translateY(0)' : 'translateY(-10px)') : 'translateY(0)',
              transition: 'all 0.3s ease-in-out',
              marginBottom: isMobile && !showDescription ? '0' : '25px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
            }}
            tabIndex={isMobile && !showDescription ? -1 : 0}
            role="region"
            aria-label="Application description"
          >
            <p style={{ marginTop: 0 }}>
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
          theme={theme} 
        />
        <PromptList prompts={prompts} theme={theme} />
      </div>
    </ThemeContext.Provider>
  );
}
