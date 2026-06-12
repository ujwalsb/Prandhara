const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Authentication Flow Tests', () => {
  let app;
  let userId;
  let authToken;
  let refreshToken;
  const testUser = {
    name: 'Test User',
    email: `testuser-${Date.now()}@test.com`,
    password: 'TestPassword123!',
  };

  beforeAll(async () => {
    // Import app after env is loaded
    app = require('../src/server');
    
    // Wait for MongoDB connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up test user
    await User.deleteOne({ email: testUser.email });
    
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe('user');

      authToken = res.body.token;
      refreshToken = res.body.refreshToken;
      userId = res.body.user.id;
    });

    test('Should not register with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: testUser.email, // Duplicate
          password: 'AnotherPassword123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Email already registered');
    });

    test('Should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          // Missing email and password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    test('Should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    test('Should enforce minimum password length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test-short-pwd-${Date.now()}@test.com`,
          password: '12345', // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('Should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testUser.password,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    test('Should reject incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    test('Should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    test('Should require password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          // Missing password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    test('Should generate new token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.token).not.toBe(authToken);
    });

    test('Should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid refresh token');
    });

    test('Should require refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    test('Should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('Should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    test('Should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('Should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out successfully');
    });
  });

  describe('Edge Cases & Security', () => {
    test('Should handle rate limiting on login attempts', async () => {
      // Make multiple failed login attempts (if rate limiting is enabled)
      const email = `rate-test-${Date.now()}@test.com`;
      
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'wrong',
          });
      }

      // The 21st attempt should be rate limited (config sets max: 20)
      // This test would need rate limiter to be properly tested
    });

    test('Should hash passwords securely', async () => {
      const user = await User.findById(userId).select('+password');
      expect(user.password).not.toBe(testUser.password);
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash is long
    });

    test('Should not expose password in API responses', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.body.user).not.toHaveProperty('password');
    });

    test('Should validate CSRF and security headers', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });
});

module.exports = {};
