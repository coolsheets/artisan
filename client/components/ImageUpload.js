import { useState, useRef } from 'react';
import { useTheme, getThemeStyles } from '../utils/themeUtils';

export default function ImageUpload({ onImageAnalysis, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Get current theme
  const { theme } = useTheme();
  const currentTheme = getThemeStyles(theme);
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  
  // Process the selected file
  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError && onError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      onError && onError('File size exceeds 5MB limit');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload file
    uploadFile(file);
  };
  
  // Upload the file to the server with progress simulation
  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Simulate progress up to 90% (real completion will set to 100%)
          const newProgress = prev + (5 * Math.random());
          return newProgress < 90 ? newProgress : 90;
        });
      }, 100);
      
      // Actual upload
      const response = await fetch('/api/imageUpload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Image upload failed');
      }
      
      // Complete progress animation
      setUploadProgress(100);
      
      // Generate prompt suggestions
      await generatePromptSuggestions(result.data.analysis);
      
      // Call callback with analysis result
      onImageAnalysis && onImageAnalysis(result.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError && onError(`Upload failed: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500); // Keep status visible briefly after upload completes
    }
  };
  
  // Generate prompt suggestions from image analysis
  const generatePromptSuggestions = async (analysis) => {
    try {
      const response = await fetch('/api/imagePrompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate prompt suggestions');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error generating prompt suggestions:', error);
      throw error;
    }
  };
  
  // Clear the selected image
  const clearImage = () => {
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  return (
    <div className="fadeIn" style={{
      width: '100%',
      marginBottom: '20px',
    }}>
      {/* Upload status and progress bar */}
      {isUploading && (
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          borderRadius: '8px',
          backgroundColor: currentTheme.cardBg,
          border: `1px solid ${currentTheme.border}`,
          color: currentTheme.text
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span>Uploading and analyzing image...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: currentTheme.border,
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${uploadProgress}%`,
              backgroundColor: currentTheme.primary,
              borderRadius: '3px',
              transition: 'width 0.2s ease'
            }} />
          </div>
        </div>
      )}
      
      {/* Drop area */}
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? currentTheme.primary : currentTheme.border}`,
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center',
          backgroundColor: isDragging 
            ? `${currentTheme.primary}15` // 15% opacity version of primary color
            : currentTheme.cardBg,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          boxShadow: isDragging ? `0 0 0 3px ${currentTheme.primary}30` : 'none'
        }}
        aria-label="Drag and drop area for image upload"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
        
        {previewUrl ? (
          <div style={{ 
            position: 'relative',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: `0 4px 12px ${currentTheme.shadowColor}`
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              aria-label="Remove image"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: currentTheme.danger,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '0',
                boxShadow: `0 2px 5px ${currentTheme.shadowColor}`,
                transition: 'transform 0.2s ease, background-color 0.2s ease',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 0',
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '10px',
              color: '#007bff',
            }}>
              📷
            </div>
            <div style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              color: '#6c757d',
              marginBottom: '8px',
            }}>
              {isDragging ? 'Drop image here' : 'Drag & drop an image or click to browse'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#aaa',
            }}>
              JPG, PNG, GIF, WebP (Max 5MB)
            </div>
          </div>
        )}
        
        {isUploading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            zIndex: 1,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '10px',
              }} />
              <div style={{ fontSize: '14px', color: '#007bff' }}>
                Analyzing image...
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
