/**
 * Image Analysis Utility
 * 
 * This module provides functionality to analyze image content and extract useful 
 * information for prompt generation.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Analyzes an image and extracts key information
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - Analysis results
 */
const analyzeImage = async (imagePath) => {
  try {
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    
    // Extract basic image information
    const imageInfo = {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: Math.round((metadata.width / metadata.height) * 100) / 100,
      hasAlpha: metadata.hasAlpha,
      colorSpace: metadata.space,
      orientation: metadata.orientation || 'normal',
      isPortrait: metadata.height > metadata.width,
    };
    
    // Color analysis
    const { dominant, palette } = await extractColorInfo(imagePath);
    
    // Content analysis - in a real app, this would use an AI service
    // Here we're using a basic simulation
    const contentAnalysis = simulateContentAnalysis(imageInfo, dominant);
    
    return {
      technical: imageInfo,
      colors: {
        dominant,
        palette
      },
      content: contentAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

/**
 * Extracts color information from an image
 * @param {string} imagePath - Path to the image
 * @returns {Promise<Object>} - Color analysis results
 */
const extractColorInfo = async (imagePath) => {
  // In a production app, we'd use a more sophisticated color extraction
  // For now, we'll use Sharp to get a simplified palette
  
  // Resize for faster processing
  const buffer = await sharp(imagePath)
    .resize(100, 100, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { data, info } = buffer;
  const { width, height, channels } = info;
  
  // Simple color averaging for dominant color
  let r = 0, g = 0, b = 0;
  
  for (let i = 0; i < data.length; i += channels) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  
  const pixelCount = width * height;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);
  
  // Convert to hex
  const dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  
  // For palette, we'd normally use a clustering algorithm
  // For now, we'll create a simple simulated palette
  const palette = [
    dominantColor,
    adjustColor(dominantColor, 30),
    adjustColor(dominantColor, -30),
    adjustColor(dominantColor, 60),
    adjustColor(dominantColor, -60),
  ];
  
  return {
    dominant: dominantColor,
    palette: palette
  };
};

/**
 * Helper function to adjust a hex color
 * @param {string} color - Hex color string
 * @param {number} amount - Amount to adjust
 * @returns {string} - New hex color
 */
const adjustColor = (color, amount) => {
  const hex = color.replace('#', '');
  const r = clamp(parseInt(hex.substring(0, 2), 16) + amount);
  const g = clamp(parseInt(hex.substring(2, 4), 16) + amount);
  const b = clamp(parseInt(hex.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Clamp a value between 0 and 255
 */
const clamp = (value) => Math.max(0, Math.min(255, value));

/**
 * Simulates basic content analysis based on image properties
 * In production, this would be replaced with an actual image recognition API
 * @param {Object} imageInfo - Basic image information
 * @param {string} dominantColor - Dominant color in hex
 * @returns {Object} - Simulated content analysis
 */
const simulateContentAnalysis = (imageInfo, dominantColor) => {
  // Convert hex to RGB
  const hex = dominantColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Brightness calculation
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Color category
  let colorCategory;
  if (r > g + 50 && r > b + 50) colorCategory = 'red';
  else if (g > r + 50 && g > b + 50) colorCategory = 'green';
  else if (b > r + 50 && b > g + 50) colorCategory = 'blue';
  else if (r > 200 && g > 200 && b < 100) colorCategory = 'yellow';
  else if (r > 200 && g < 100 && b > 200) colorCategory = 'purple';
  else if (r > 200 && g > 150 && b > 200) colorCategory = 'pink';
  else if (r < 100 && g > 150 && b > 200) colorCategory = 'cyan';
  else if (r > 200 && g > 100 && b < 100) colorCategory = 'orange';
  else if (r > 200 && g > 200 && b > 200) colorCategory = 'white';
  else if (r < 50 && g < 50 && b < 50) colorCategory = 'black';
  else colorCategory = 'neutral';
  
  // Make some guesses based on image properties
  let possibleSubjects = [];
  
  if (imageInfo.isPortrait) {
    possibleSubjects.push('portrait', 'person', 'building');
  } else {
    possibleSubjects.push('landscape', 'scene', 'group');
  }
  
  if (colorCategory === 'blue' || colorCategory === 'cyan') {
    possibleSubjects.push('sky', 'water', 'ocean');
  } else if (colorCategory === 'green') {
    possibleSubjects.push('nature', 'forest', 'grass');
  } else if (colorCategory === 'orange' || colorCategory === 'red') {
    possibleSubjects.push('sunset', 'fire', 'autumn');
  }
  
  return {
    likelyScene: imageInfo.isPortrait ? 'portrait/close-up' : 'landscape/wide shot',
    brightness: brightness < 0.4 ? 'dark' : brightness > 0.7 ? 'bright' : 'balanced',
    colorTone: colorCategory,
    possibleSubjects,
    disclaimer: 'This is a simulated analysis. For production use, integrate with an actual image recognition API.'
  };
};

module.exports = { analyzeImage };
