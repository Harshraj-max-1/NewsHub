const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Bookmark = require('../src/models/Bookmark');
const ReadingHistory = require('../src/models/ReadingHistory');
const config = require('../src/config/env');

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
});

afterAll(async () => {
  // Clean test user data
  await User.deleteMany({ email: /test.*@example\.com/ });
  await mongoose.connection.close();
});

describe('NewsHub Full-Stack API Suite', () => {
  let authToken = '';
  let testUserId = '';
  const testEmail = `test_${Date.now()}@example.com`;

  describe('1. System & Health', () => {
    it('GET /api/health should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('healthy');
      expect(res.body.service).toEqual('NewsHub API');
    });
  });

  describe('2. Authentication & User Profile', () => {
    it('POST /api/auth/register should create user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Editorial Tester',
          email: testEmail,
          password: 'Password123!',
          interests: ['technology', 'ai', 'science']
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);

      authToken = res.body.token;
      testUserId = res.body.user.id;
    });

    it('POST /api/auth/login should authenticate user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toEqual('Editorial Tester');
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.user.email).toEqual(testEmail);
    });

    it('PUT /api/users/preferences should update user topics', async () => {
      const res = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          interests: ['ai', 'startups', 'science'],
          theme: 'dark'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.interests).toContain('ai');
      expect(res.body.data.theme).toEqual('dark');
    });
  });

  describe('3. News Aggregation, Search & Recommendations', () => {
    it('GET /api/news/top should return curated top headlines', async () => {
      const res = await request(app).get('/api/news/top');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.articles.length).toBeGreaterThan(0);
      expect(res.body.data.articles[0]).toHaveProperty('title');
      expect(res.body.data.articles[0]).toHaveProperty('imageUrl');
      expect(res.body.data.articles[0]).toHaveProperty('sourceName');
    });

    it('GET /api/news/category/technology should return tech articles', async () => {
      const res = await request(app).get('/api/news/category/technology');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.articles.length).toBeGreaterThan(0);
      expect(res.body.data.articles.every(a => a.category === 'technology' || a.category === 'ai')).toBe(true);
    });

    it('GET /api/news/search with query should return matched results', async () => {
      const res = await request(app).get('/api/news/search?q=quantum');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.articles.length).toBeGreaterThan(0);
    });

    it('GET /api/news/personalized should calculate recommendation scores and reasons', async () => {
      const res = await request(app)
        .get('/api/news/personalized')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.articles.length).toBeGreaterThan(0);
      const first = res.body.data.articles[0];
      expect(first).toHaveProperty('recommendation');
      expect(first.recommendation).toHaveProperty('score');
      expect(first.recommendation.reasons.length).toBeGreaterThan(0);
    });

    it('GET /api/news/trending should return trending stories', async () => {
      const res = await request(app).get('/api/news/trending?limit=5');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('trendingScore');
    });
  });

  describe('4. Bookmarks System', () => {
    const sampleArticleId = 'art-tech-01';

    it('POST /api/bookmarks should save article to bookmarks', async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          articleId: sampleArticleId,
          title: 'The Next Architectural Shift in Foundation Models',
          description: 'Researchers unveil new transformer paradigms',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
          sourceName: 'The Verge',
          articleUrl: 'https://www.theverge.com/tech/ai-multimodal',
          category: 'ai'
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/bookmarks/ids should list saved article IDs', async () => {
      const res = await request(app)
        .get('/api/bookmarks/ids')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toContain(sampleArticleId);
    });

    it('DELETE /api/bookmarks/:articleId should remove bookmark', async () => {
      const res = await request(app)
        .delete(`/api/bookmarks/${sampleArticleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Reading History & Analytics', () => {
    it('POST /api/history should record article open event', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          articleId: 'art-sci-01',
          title: 'James Webb Space Telescope Identifies Atmospheric Water Vapor',
          sourceName: 'Nature',
          articleUrl: 'https://www.nature.com/articles/jwst-exoplanet',
          category: 'science'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.articleId).toEqual('art-sci-01');
    });

    it('GET /api/history should return grouped reading history', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.grouped).toHaveProperty('today');
      expect(res.body.grouped.today.length).toBeGreaterThan(0);
    });

    it('GET /api/analytics should compute reading activity metrics', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.stats).toHaveProperty('articlesRead');
      expect(res.body.data).toHaveProperty('weeklyActivity');
      expect(res.body.data).toHaveProperty('categoryDistribution');
    });
  });
});
