import { useState, useRef } from 'react';

export default function ImageUpload({ onImageAnalysis, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  
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
  
  // Upload the file to the server
  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/imageUpload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Image upload failed');
      }
      
      // Generate prompt suggestions
      await generatePromptSuggestions(result.data.analysis);
      
      // Call callback with analysis result
      onImageAnalysis && onImageAnalysis(result.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError && onError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
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
    <div style={{
      width: '100%',
      marginBottom: '20px',
    }}>
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#e9f6ff' : '#f8f9fa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
        
        {previewUrl ? (
          <div style={{ position: 'relative' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '6px',
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
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
