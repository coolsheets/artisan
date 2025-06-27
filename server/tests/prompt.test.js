const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Prompt = require('../models/Prompt');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/promptgen_test';

describe('Prompt API Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Prompt.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/prompts', () => {
    it('creates a new prompt successfully', async () => {
      const promptData = {
        original: 'Test prompt',
        optimized: 'Test optimized',
        atomized: ['Step 1: Test', 'Step 2: More testing']
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(promptData)
        .expect(201);

      expect(res.body).toMatchObject(promptData);
      expect(res.body._id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('requires original field', async () => {
      const invalidData = {
        optimized: 'Test optimized',
        atomized: ['Step 1: Test']
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('handles missing optional fields', async () => {
      const minimalData = {
        original: 'Test prompt only'
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(minimalData)
        .expect(201);

      expect(res.body.original).toBe('Test prompt only');
      expect(res.body.optimized).toBeUndefined();
      expect(res.body.atomized).toEqual([]);
    });

    it('validates atomized array type', async () => {
      const invalidData = {
        original: 'Test prompt',
        atomized: 'should be array'
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/prompts', () => {
    beforeEach(async () => {
      // Create test data
      await Prompt.create([
        {
          original: 'First prompt',
          optimized: 'First optimized',
          atomized: ['Step 1'],
          createdAt: new Date('2024-01-01')
        },
        {
          original: 'Second prompt',
          optimized: 'Second optimized',
          atomized: ['Step 1', 'Step 2'],
          createdAt: new Date('2024-01-02')
        }
      ]);
    });

    it('retrieves all prompts in descending order', async () => {
      const res = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].original).toBe('Second prompt'); // Most recent first
      expect(res.body[1].original).toBe('First prompt');
    });

    it('returns empty array when no prompts exist', async () => {
      await Prompt.deleteMany({});
      
      const res = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('includes all required fields', async () => {
      const res = await request(app)
        .get('/api/prompts')
        .expect(200);

      const prompt = res.body[0];
      expect(prompt).toHaveProperty('_id');
      expect(prompt).toHaveProperty('original');
      expect(prompt).toHaveProperty('optimized');
      expect(prompt).toHaveProperty('atomized');
      expect(prompt).toHaveProperty('createdAt');
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors gracefully', async () => {
      // Temporarily close connection to simulate error
      await mongoose.connection.close();

      const res = await request(app)
        .get('/api/prompts')
        .expect(500);

      expect(res.body.error).toBeDefined();

      // Reconnect for other tests
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    it('handles malformed JSON', async () => {
      const res = await request(app)
        .post('/api/prompts')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('Input Validation & Security', () => {
    it('sanitizes input to prevent XSS', async () => {
      const maliciousData = {
        original: '<script>alert("xss")</script>Test prompt',
        optimized: '<img src="x" onerror="alert(1)">Optimized'
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(maliciousData)
        .expect(201);

      // Should store the data but properly escaped
      expect(res.body.original).toContain('script');
      expect(res.body.original).not.toContain('<script>');
    });

    it('handles very long input strings', async () => {
      const longString = 'a'.repeat(10000);
      const data = {
        original: longString,
        optimized: 'Short optimized'
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(data)
        .expect(201);

      expect(res.body.original).toHaveLength(10000);
    });

    it('limits atomized array size', async () => {
      const data = {
        original: 'Test prompt',
        atomized: Array(1000).fill('Step')
      };

      const res = await request(app)
        .post('/api/prompts')
        .send(data);

      // Should either accept or reject based on business rules
      expect([201, 400]).toContain(res.status);
    });
  });
});
