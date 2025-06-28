/**
 * Image Controller
 * 
 * Handles image uploads and analysis for prompt generation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { analyzeImage } = require('../utils/imageAnalyzer');

// Configure storage - ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
});

/**
 * Upload and analyze an image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadAndAnalyzeImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Process the uploaded file
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    // Analyze the image
    const analysisResult = await analyzeImage(filePath);
    
    // Combine file info with analysis
    const result = {
      fileInfo: {
        originalName: req.file.originalname,
        filename: fileName,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      analysis: analysisResult
    };
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Image processing failed: ${error.message}` 
    });
  }
};

/**
 * Generate prompt suggestions based on image analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateImagePrompts = async (req, res) => {
  try {
    const { analysis } = req.body;
    
    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: 'Image analysis data is required'
      });
    }
    
    // Generate prompt suggestions based on image analysis
    const promptSuggestions = generatePromptSuggestions(analysis);
    
    return res.status(200).json({
      success: true,
      data: promptSuggestions
    });
  } catch (error) {
    console.error('Error generating prompt suggestions:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to generate prompt suggestions: ${error.message}`
    });
  }
};

/**
 * Helper function to generate prompt suggestions based on image analysis
 * @param {Object} analysis - Image analysis result
 * @returns {Object} - Prompt suggestions
 */
const generatePromptSuggestions = (analysis) => {
  const { technical, colors, content } = analysis;
  
  // Generate descriptive text based on analysis
  const descriptors = [];
  
  // Add scene type
  descriptors.push(content.likelyScene);
  
  // Add brightness
  descriptors.push(content.brightness);
  
  // Add color tone
  descriptors.push(`${content.colorTone} tones`);
  
  // Add possible subjects
  const subjects = content.possibleSubjects.slice(0, 3).join(', ');
  
  // Create prompt suggestions
  return {
    descriptive: `A ${descriptors.join(', ')} image featuring ${subjects}.`,
    technical: `Image details: ${technical.width}×${technical.height} ${technical.format} image with ${content.colorTone} dominant colors and ${content.brightness} lighting.`,
    creative: `Create content inspired by this ${content.brightness} ${content.colorTone}-toned ${content.likelyScene} visual, possibly depicting ${subjects}.`,
    combined: `Using the uploaded ${technical.format} image (${technical.width}×${technical.height}, ${content.colorTone} palette, ${content.brightness} exposure) that appears to show ${subjects}, optimize my prompt to:`,
    contextPrompt: `I'm working with a ${technical.width}×${technical.height} ${technical.format} image that has ${content.colorTone} dominant colors with ${content.brightness} lighting. The image likely depicts ${subjects}.`
  };
};

// Cleanup uploads older than 1 hour (in a production app)
const cleanupOldUploads = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        
        if (stats.mtimeMs < oneHourAgo) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error('Error deleting file:', err);
              return;
            }
            console.log(`Deleted old upload: ${file}`);
          });
        }
      });
    });
  });
};

// Run cleanup every hour
setInterval(cleanupOldUploads, 60 * 60 * 1000);

module.exports = {
  upload: upload.single('image'),
  uploadAndAnalyzeImage,
  generateImagePrompts
};
