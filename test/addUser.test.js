const { addUser } = require('../controllers/users');
const pool = require('../db/connection');

jest.mock('../db/connection', () => ({
  query: jest.fn()
}));

describe('User Controllers - addUser', () => {

  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should add a user successfully', async () => {
    req.body = { username: 'testuser', password: '123', student_id: '65000000', email: 'a@a.com', gender: 'M', age: 20 };
    const mockResult = { rows: [{ id: 1, username: 'testuser' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, user: mockResult.rows[0] });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if username or email is duplicate (code 23505)', async () => {
    req.body = { username: 'dupuser', password: '123', student_id: '65000000', gender: 'M' };
    const error = new Error('Duplicate error');
    error.code = '23505';
    pool.query.mockRejectedValueOnce(error);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });
  });

  it('should return 500 on other database errors', async () => {
    req.body = { username: 'erruser', password: '123', student_id: '65000000', gender: 'M' };
    const error = new Error('Database is down');
    pool.query.mockRejectedValueOnce(error);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Database is down' });
  });

});
