const { addUser } = require('../controllers/users');
const pool = require('../db/connection');

jest.mock('../db/connection', () => ({
  query: jest.fn()
}));

describe('Unit Test Cases - Data Structure & Validation', () => {

  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // Test ID: 01
  it('01: ควรตรวจสอบข้อมูลผู้ใช้ที่ถูกต้องครบถ้วนผ่าน และ สร้าง Object/Payload ไม่มี Error', async () => {
    req.body = { 
      username: 'teststudent', 
      password: 'password123', 
      student_id: '65000000', 
      email: 'test@student.com', 
      gender: 'M' 
    };
    
    // จำลองการ query ฐานข้อมูลสำเร็จ
    const mockResult = { rows: [{ id: 1, ...req.body, generation: '65', visible: true }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    
    // คาดหวังการทำงานสำเร็จตามปกติ (หมายเหตุ: ใน controller จริงอาจส่ง 201)
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, user: mockResult.rows[0] });
  });

  // Test ID: 02
  it('02: กรณีไม่ส่ง username (Missing Required Field) ระบบควรแจ้งเตือน 400', async () => {
    req.body = { password: 'password123', student_id: '65000000', email: 'test@student.com', gender: 'M' };
    
    await addUser(req, res);
    // ต้องตรวจสอบ Validation ใน controller ว่าตอบกลับ 400
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Missing username') }));
  });

  // Test ID: 03
  it('03: กรณีไม่ส่ง password (Missing Required Field) ระบบควรแจ้งเตือน 400', async () => {
    req.body = { username: 'teststudent', student_id: '65000000', email: 'test@student.com', gender: 'M' };
    
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Missing password') }));
  });

  // Test ID: 04
  it('04: กรณีไม่ส่ง student_id (Missing Required Field) ระบบควรแจ้งเตือน 400', async () => {
    req.body = { username: 'teststudent', password: 'password123', email: 'test@student.com', gender: 'M' };
    
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Missing student_id') }));
  });

  // Test ID: 05
  it('05: กรณีไม่ส่ง gender (Missing Required Field) ระบบควรแจ้งเตือน 400', async () => {
    req.body = { username: 'teststudent', password: 'password123', student_id: '65000000', email: 'test@student.com' };
    
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Missing gender') }));
  });

  // Test ID: 06
  it('06: ตรวจสอบกรณี username หรือ email ซ้ำ ต้องแจ้ง Error Code 23505', async () => {
    req.body = { username: 'duplicateUser', password: '123', student_id: '65000000', email: 'dup@student.com', gender: 'F' };
    
    const error = new Error('Duplicate error');
    error.code = '23505';
    pool.query.mockRejectedValueOnce(error);

    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });
  });

  // Test ID: 07
  it('07: ถ้านักศึกษาไม่ได้แนบ photo มาใน Payload ข้อมูลต้องถูกตั้งเป็น default.png', async () => {
    // ใส่ข้อมูลที่จำเป็นครบ แต่ไม่มี photo
    req.body = { username: 'teststudent', password: '123', student_id: '65000000', email: 'test@student.com', gender: 'O' };
    
    // ตรวจสอบ query parameters (สมมติว่ามีการส่ง default.png ใน query หรือจัดการใน controller)
    const mockResult = { rows: [{ id: 1, photo: 'default.png' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    // ตรวจสอบว่าพารามิเตอร์ที่ถูกเรียก query ไปยัง db มี 'default.png'
    const queryParams = pool.query.mock.calls[0][1];
    expect(queryParams).toContain('default.png');
  });

  // Test ID: 08
  it('08: กรณีไม่ได้ส่ง Array ของ skills และ bio ต้องลงฐานด้วยค่าตั้งต้น', async () => {
    req.body = { username: 'teststudent', password: '123', student_id: '65000000', email: 'test@student.com', gender: 'O' };
    
    const mockResult = { rows: [{ id: 1 }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    
    const queryParams = pool.query.mock.calls[0][1];
    // ตรวจสอบว่ามีค่าว่าง string '' สำหรับ bio และ อาเรย์ '[]' สำหรับ skills ถูกส่งไป query 
    // หมายเหตุ: ต้องระบุ index สำหรับพารามิเตอร์ใน controller ของคุณ 
    expect(queryParams).toContain(''); // bio
    expect(queryParams).toContain('[]'); // skills
  });

  // Test ID: 09
  it('09: ตรวจสอบค่าเริ่มต้นของ visible ถ้านักศึกษาไม่ได้ส่งมา ต้องถูกตั้งเป็น true โดยอัตโนมัติ', async () => {
    req.body = { username: 'teststudent', password: '123', student_id: '65000000', email: 'test@student.com', gender: 'O' };
    
    const mockResult = { rows: [{ id: 1, visible: true }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    const queryParams = pool.query.mock.calls[0][1];
    // คาดหวังว่ามี true เป็นส่วนหนึ่งของ query parameters
    expect(queryParams).toContain(true);
  });

  // Test ID: 10
  it('10: ระบบตรวจจับ student_id แล้วนำมาตัดสร้างข้อมูล field generation (เช่น "65000000" ได้ "65")', async () => {
    req.body = { username: 'teststudent', password: '123', student_id: '65000000', email: 'test@student.com', gender: 'O' };
    
    const mockResult = { rows: [{ id: 1, generation: '65' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    await addUser(req, res);
    
    // ตรวจสอบว่าใน parameter ที่ถูกส่งเข้า query มีค่า '65' จาก generation
    const queryParams = pool.query.mock.calls[0][1];
    expect(queryParams).toContain('65');
  });

});
