// controllers/users.js
const pool = require('../db/connection'); 

// Login
const login = async (req, res) => {
  const { username, password } = req.body;

  // Hardcode admin
  if (username === 'admin' && password === 'hardcode') {
    return res.json({ success: true, role: 'admin' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1 AND password=$2 AND visible=true',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add user
const addUser = async (req, res) => {
  const { username, password, email, faculty, gender, age, photo } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users 
       (username,password,email,faculty,gender,age,photo,visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [username, password, email, faculty, gender, age, photo || 'default.png', true]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    // ถ้า username/email ซ้ำ
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all visible users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, faculty, gender, age, photo FROM users WHERE visible=true ORDER BY age'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search / Filter users
const searchUsers = async (req, res) => {
  const { keyword, gender, faculty } = req.query;

  try {
    let query = 'SELECT id, username, email, faculty, gender, age, photo FROM users WHERE visible=true';
    let params = [];

    if (keyword) {
      params.push(`%${keyword}%`);
      query += ` AND username ILIKE $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      query += ` AND gender=$${params.length}`;
    }
    if (faculty) {
      params.push(faculty);
      query += ` AND faculty=$${params.length}`;
    }

    query += ' ORDER BY age';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, faculty, gender, age, photo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1,email=$2,faculty=$3,gender=$4,age=$5,photo=$6
       WHERE id=$7 RETURNING *`,
      [username, email, faculty, gender, age, photo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set visibility (soft delete)
const setVisibility = async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET visible=$1 WHERE id=$2 RETURNING *',
      [visible !== undefined ? visible : true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, addUser, getUsers, searchUsers, updateUser, setVisibility };