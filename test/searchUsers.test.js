const { searchUsers } = require('../controllers/users');
const pool = require('../db/connection');

jest.mock('../db/connection', () => ({
  query: jest.fn()
}));

describe('User Controllers - searchUsers', () => {

  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should search users with provided query parameters', async () => {
    req.query = { keyword: 'test', gender: 'F' };
    const mockResult = { rows: [{ id: 3, username: 'testgirl' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await searchUsers(req, res);
    expect(pool.query.mock.calls[0][0]).toContain('username ILIKE $1');
    expect(pool.query.mock.calls[0][0]).toContain('gender=$2');
    expect(pool.query.mock.calls[0][1]).toEqual(['%test%', 'F']);
    expect(res.json).toHaveBeenCalledWith(mockResult.rows);
  });

});
