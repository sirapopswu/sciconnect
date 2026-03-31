const { updateUser } = require('../controllers/users');
const pool = require('../db/connection');

jest.mock('../db/connection', () => ({
  query: jest.fn()
}));

describe('User Controllers - updateUser', () => {

  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should update a user successfully', async () => {
    req.params = { id: '1' };
    req.body = { username: 'updateduser', email: 'up@up.com' };
    const mockResult = { rows: [{ id: 1, username: 'updateduser' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await updateUser(req, res);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(mockResult.rows[0]);
  });

  it('should return 404 if user to update is not found', async () => {
    req.params = { id: '99' };
    req.body = { username: 'updatethis' };
    const mockResult = { rows: [] }; // No row returned for UPDATE
    pool.query.mockResolvedValueOnce(mockResult);

    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'ไม่พบผู้ใช้นี้' });
  });

});
