const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const { analyzeImage } = require('../utils/imageAnalyzer');

// Mock the imageAnalyzer utility
jest.mock('../utils/imageAnalyzer', () => ({
  analyzeImage: jest.fn().mockResolvedValue({
    technical: {
      format: 'jpeg',
      width: 800,
      height: 600
    },
    colors: {
      dominant: '#336699',
      palette: ['#336699', '#447799', '#558899']
    },
    content: {
      likelyScene: 'landscape',
      brightness: 'balanced',
      colorTone: 'blue',
      possibleSubjects: ['sky', 'ocean', 'nature']
    }
  })
}));

describe('Image API Routes', () => {
  const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
  
  // Create test image file if it doesn't exist
  beforeAll(() => {
    const fixturesDir = path.join(__dirname, 'fixtures');
    
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir);
    }
    
    if (!fs.existsSync(testImagePath)) {
      // Create a simple JPG buffer for testing
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      fs.writeFileSync(testImagePath, buffer);
    }
  });
  
  // Clean up after tests
  afterAll(() => {
    try {
      fs.unlinkSync(testImagePath);
      fs.rmdirSync(path.join(__dirname, 'fixtures'));
    } catch (err) {
      console.error('Error cleaning up test files:', err);
    }
  });

  describe('POST /api/images/upload', () => {
    it('should reject when no file is provided', async () => {
      const res = await request(app)
        .post('/api/images/upload');
        
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No image file');
    });

    it('should analyze an uploaded image', async () => {
      const res = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileInfo).toBeDefined();
      expect(res.body.data.analysis).toBeDefined();
      expect(res.body.data.analysis.technical.format).toBe('jpeg');
    });
  });

  describe('POST /api/images/prompt', () => {
    it('should reject when no analysis data is provided', async () => {
      const res = await request(app)
        .post('/api/images/prompt')
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate prompt suggestions from image analysis', async () => {
      const res = await request(app)
        .post('/api/images/prompt')
        .send({
          analysis: {
            technical: {
              format: 'jpeg',
              width: 800,
              height: 600
            },
            colors: {
              dominant: '#336699'
            },
            content: {
              likelyScene: 'landscape',
              brightness: 'balanced',
              colorTone: 'blue',
              possibleSubjects: ['sky', 'ocean', 'nature']
            }
          }
        });
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.descriptive).toContain('landscape');
      expect(res.body.data.technical).toContain('800×600');
      expect(res.body.data.creative).toBeDefined();
      expect(res.body.data.combined).toBeDefined();
      expect(res.body.data.contextPrompt).toBeDefined();
    });
  });
});
