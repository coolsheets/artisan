import { useTheme, getThemeStyles } from '../utils/themeUtils';
import { useState, useEffect } from 'react';

export default function PromptList({ prompts }) {
  const { theme } = useTheme();
  const currentTheme = getThemeStyles(theme);
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowHistory(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Toggle expanded state of a prompt
  const togglePrompt = (index) => {
    setExpandedPrompt(expandedPrompt === index ? null : index);
  };
  
  if (!prompts.length) return null;
  
  return (
    <section 
      aria-labelledby="history-heading"
      className="fadeIn"
      style={{
        marginTop: '40px',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: `2px solid ${currentTheme.border}`,
          paddingBottom: '12px',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '0' : '8px',
            padding: isMobile ? '12px' : '10px 16px',
            backgroundColor: showHistory ? currentTheme.primary : 'transparent',
            border: `1px solid ${currentTheme.primary}`,
            borderRadius: isMobile ? '50%' : '24px',
            color: showHistory ? currentTheme.buttonText : currentTheme.primary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '20px' : 'inherit',
            width: isMobile ? '44px' : 'auto',
            height: isMobile ? '44px' : 'auto',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            if (!showHistory) {
              e.target.style.backgroundColor = `${currentTheme.primary}20`;
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showHistory) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }
          }}
          aria-expanded={showHistory}
          aria-controls="history-content"
          aria-label={showHistory ? "Hide prompts history" : "Show prompts history"}
        >
          <span role="img" aria-hidden="true" style={{ fontSize: isMobile ? '1.2em' : '0.9em' }}>📚</span>
          {!isMobile && <span id="history-heading">Generated Prompts History</span>}
        </button>

        {isMobile && showHistory && (
          <span 
            style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              color: currentTheme.secondaryText,
              fontWeight: '500'
            }}
          >
            {prompts.length} {prompts.length === 1 ? 'Prompt' : 'Prompts'}
          </span>
        )}
      </div>
      
      <div 
        id="history-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: showHistory ? 'auto' : '0',
          opacity: showHistory ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          marginTop: showHistory ? '20px' : '0'
        }}
      >
        {prompts.map((p, idx) => (
          <div 
            key={idx} 
            className={idx === 0 ? 'slideUp' : ''}
            style={{
              padding: 'clamp(16px, 3vw, 24px)',
              backgroundColor: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              lineHeight: '1.6',
              boxShadow: `0 4px 12px ${currentTheme.shadowColor}`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => togglePrompt(idx)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${currentTheme.shadowColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${currentTheme.shadowColor}`;
            }}
            tabIndex="0"
            role="button"
            aria-expanded={expandedPrompt === idx ? 'true' : 'false'}
            aria-controls={`prompt-details-${idx}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePrompt(idx);
              }
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: expandedPrompt === idx ? '15px' : '0'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(16px, 2.8vw, 18px)',
                fontWeight: '600',
                color: currentTheme.text
              }}>
                Prompt #{prompts.length - idx}
              </h3>
              <span 
                style={{ 
                  fontSize: '20px', 
                  transition: 'transform 0.3s ease',
                  transform: expandedPrompt === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                aria-hidden="true"
              >
                ⌄
              </span>
            </div>
            
            <div 
              id={`prompt-details-${idx}`}
              style={{ 
                height: expandedPrompt === idx ? 'auto' : '0',
                overflow: 'hidden',
                opacity: expandedPrompt === idx ? 1 : 0,
                transition: 'opacity 0.3s ease',
                marginTop: expandedPrompt === idx ? '15px' : '0'
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ 
                  color: currentTheme.secondaryText,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span role="img" aria-hidden="true">📝</span>
                  Original:
                </strong>
                <div style={{ 
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#2b3035',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.border}`,
                  wordWrap: 'break-word'
                }}>
                  {p.original}
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ 
                  color: currentTheme.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span role="img" aria-hidden="true">✨</span>
                  Optimized:
                </strong>
                <div style={{ 
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: `${currentTheme.success}15`,
                  borderRadius: '4px',
                  border: '1px solid #c3e6cb',
                  wordWrap: 'break-word'
                }}>
                  {p.optimized}
                </div>
              </div>
            
              {p.atomized && p.atomized.length > 0 && (
                <div>
                  <strong style={{ color: '#007bff' }}>Atomized Steps:</strong>
                  <ul style={{
                    marginTop: '8px',
                    marginBottom: '0',
                    paddingLeft: 'clamp(16px, 3vw, 20px)',
                    backgroundColor: '#cce7ff',
                    padding: '8px clamp(16px, 3vw, 20px)',
                    borderRadius: '4px',
                    border: '1px solid #99d3ff'
                  }}>
                    {p.atomized.map((a, i) => (
                      <li key={i} style={{ 
                        marginBottom: '5px',
                        wordWrap: 'break-word'
                      }}>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
