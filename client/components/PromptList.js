import { useTheme, getThemeStyles } from '../utils/themeUtils';
import { useState, useEffect } from 'react';

export default function PromptList({ prompts }) {
  const { theme } = useTheme();
  const currentTheme = getThemeStyles(theme);
  const [expandedPrompt, setExpandedPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);
  
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
  
  // Toggle info popup visibility
  const toggleInfoPopup = () => {
    setIsInfoPopupOpen(prev => !prev);
  };

  const [fetchError, setFetchError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Enhanced fetch error handling with retry mechanism
  const fetchWithErrorHandling = async (url, options, retryCount = 0) => {
    try {
      setIsRetrying(retryCount > 0);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        throw new Error(`Request failed with status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }
      
      setFetchError(null);
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      
      const errorMessage = 
        error.message === 'Failed to fetch' ? 
          'Network connection issue. Check your internet connection.' :
          `Error fetching data: ${error.message}`;
      
      setFetchError(errorMessage);
      return null;
    } finally {
      setIsRetrying(false);
    }
  };

  // Retry mechanism
  const retryFetch = async (url, options) => {
    setIsRetrying(true);
    const result = await fetchWithErrorHandling(url, options, 1);
    setIsRetrying(false);
    return result;
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
      {/* Info Popup */}
      {isInfoPopupOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div 
            id="info-popup"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <button
              onClick={toggleInfoPopup}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: currentTheme.secondaryText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
              aria-label="Close info popup"
            >
              ✕
            </button>
            <h2 style={{ marginTop: 0, color: currentTheme.text }}>About Artisan Prompt Generator</h2>
            <div style={{ color: currentTheme.text, lineHeight: 1.6 }}>
              <p>Artisan is an AI prompt generator designed to help you create better prompts for AI image and text generation.</p>
              <p>Features:</p>
              <ul>
                <li>Optimizes your basic prompts for better results</li>
                <li>Breaks down complex requests into atomic steps</li>
                <li>Supports uploading reference images</li>
                <li>Stores your prompt history for later reference</li>
              </ul>
              <p>To get started, simply type your desired prompt in the input field and click the generate button.</p>
            </div>
          </div>
        </div>
      )}

      {fetchError && (
        <div 
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
            borderRadius: '8px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span role="img" aria-hidden="true" style={{ fontSize: '18px' }}>⚠️</span>
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => retryFetch('/api/prompts', { method: 'GET' })}
            disabled={isRetrying}
            style={{
              background: 'transparent',
              border: '1px solid #c62828',
              color: '#c62828',
              padding: '6px 12px',
              borderRadius: '16px',
              cursor: isRetrying ? 'default' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isRetrying ? 0.7 : 1
            }}
          >
            {isRetrying ? 'Retrying...' : (
              <>
                <span role="img" aria-hidden="true">🔄</span>
                <span>Retry</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: `2px solid ${currentTheme.border}`,
          paddingBottom: '12px',
          gap: '10px',
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
            fontWeight: '500',
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
          aria-label={showHistory ? 'Hide prompts history' : 'Show prompts history'}
        >
          <span role="img" aria-hidden="true" style={{ fontSize: isMobile ? '1.2em' : '0.9em' }}>📚</span>
          {!isMobile && <span id="history-heading">Generated Prompts History</span>}
        </button>

        <button
          onClick={toggleInfoPopup}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '0' : '8px',
            padding: isMobile ? '12px' : '10px 16px',
            backgroundColor: isInfoPopupOpen ? currentTheme.primary : 'transparent',
            border: `1px solid ${currentTheme.primary}`,
            borderRadius: isMobile ? '50%' : '24px',
            color: isInfoPopupOpen ? currentTheme.buttonText : currentTheme.primary,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '20px' : 'inherit',
            width: isMobile ? '44px' : 'auto',
            height: isMobile ? '44px' : 'auto',
            fontWeight: '500',
          }}
          aria-expanded={isInfoPopupOpen}
          aria-controls="info-popup"
          aria-label={isInfoPopupOpen ? "Hide Info" : "Show Info"}
          onMouseEnter={(e) => {
            if (!isInfoPopupOpen) {
              e.target.style.backgroundColor = `${currentTheme.primary}20`;
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isInfoPopupOpen) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <span role="img" aria-hidden="true" style={{ fontSize: isMobile ? '1.2em' : '0.9em' }}>ℹ️</span>
          {!isMobile && <span>{isInfoPopupOpen ? "Hide Info" : "Show Info"}</span>}
        </button>
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
