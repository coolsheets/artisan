const request = require('supertest');
const app = require('../app');

describe('POST /api/prompts', () => {
  it('creates a prompt', async () => {
    const res = await request(app)
      .post('/api/prompts')
      .send({ original: 'Test prompt', optimized: 'Test', atomized: ['Test'] });
    expect(res.statusCode).toBe(201);
    expect(res.body.original).toBe('Test prompt');
  });
});
