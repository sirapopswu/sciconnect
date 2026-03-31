const { getUsers } = require('../controllers/users');
const pool = require('../db/connection');

jest.mock('../db/connection', () => ({
  query: jest.fn()
}));

describe('User Controllers - getUsers', () => {

  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should get all users successfully', async () => {
    const mockResult = { rows: [{ id: 1, username: 'testuser' }, { id: 2, username: 'user2' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await getUsers(req, res);
    expect(pool.query).toHaveBeenCalledWith('SELECT id, username, email, major, gender, age, photo, bio, skills FROM users WHERE visible=true ORDER BY age');
    expect(res.json).toHaveBeenCalledWith(mockResult.rows);
  });

});
