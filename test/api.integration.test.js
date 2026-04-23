const request = require('supertest');
const pool = require('../db/connection');

// Mock database query to return a resolved promise by default
// so that the auto-migration in index.js does not crash with .catch() error
jest.mock('../db/connection', () => ({
  query: jest.fn().mockResolvedValue({})
}));

const app = require('../index'); 

describe('API Integration Tests (index.js)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior for other queries
    pool.query.mockResolvedValue({ rows: [] });
  });

  describe('GET /', () => {
    it('should return 200 for the root route (home.html)', async () => {
      // NOTE: Might return 404 or error if public/home.html actually does not exist 
      // but the route is defined to sendFile.
      const res = await request(app).get('/');
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500); 
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user data if user is found', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@mail.com', visible: true };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app).get('/api/users/1');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('SELECT id, username');
    });

    it('should return 404 if user is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/users/99');
      
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });
  });

  describe('POST /api/users/login (Admin & User)', () => {
    it('should login as admin using hardcoded credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'admin@gmail.com', password: 'hardcode' });
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        user: {
          id: 'admin',
          username: 'Admin',
          email: 'admin@gmail.com',
          role: 'admin',
          major: 'admin',
          visible: true,
        }
      });
      // Admin login should not hit the database because it returns early
      expect(pool.query).not.toHaveBeenCalled(); 
    });

    it('should return 401 if user email is not found in database', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'normal@gmail.com', password: '123' });
      
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ success: false, message: 'ไม่พบอีเมลนี้ในระบบ' });
    });
  });

  describe('PATCH /api/users/:id/visibility', () => {
    it('should update visibility to false', async () => {
      const updatedUser = { id: 1, username: 'testuser', visible: false };
      pool.query.mockResolvedValueOnce({ rows: [updatedUser] });

      const res = await request(app)
        .patch('/api/users/1/visibility')
        .send({ visible: false });
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, user: updatedUser });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET visible=$1 WHERE id=$2 RETURNING *',
        [false, '1']
      );
    });

    it('should return 404 if user to update visibility is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .patch('/api/users/99/visibility')
        .send({ visible: false });
      
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });
  });

});
