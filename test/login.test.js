const { login } = require('../controllers/users');

describe('User Controllers - login', () => {

  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should return 400 if email or password is missing', () => {
    req.body = { email: 'test@test.com' }; // missing password
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
  });

  it('should return 404 if user is not found', () => {
    req.body = { email: 'notfound@test.com', password: '123' };
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 401 if password does not match', () => {
    req.body = { email: 'test@test.com', password: 'wrongpassword' };
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  it('should login successfully with correct credentials', () => {
    req.body = { email: 'test@test.com', password: '1234' };
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Login successful', 
      user: { id: 1, email: 'test@test.com' } 
    });
  });

});
