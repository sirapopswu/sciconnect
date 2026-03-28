// controllers/users.js
// แก้ไข Path จาก './connection' เป็น '../db/connection' เพื่อถอยออกจากโฟลเดอร์ controllers แล้วเข้าไปที่ db
const pool = require('../db/connection'); 

// Login (admin hardcode + user)
const login = async (req, res) => {
  const { username, password } = req.body;

  // Admin hardcode
  if (username === 'admin' && password === 'hardcode') {
    return res.json({ success: true, role: 'admin' });
  }

  // ตรวจสอบใน database
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username=$1 AND password=$2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add user (เพิ่ม user + รูป + info)
const addUser = async (req, res) => {
  const { username, password, email, faculty, gender, age, photo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO users (username,password,email,faculty,gender,age,photo,visible) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [username,password,email,faculty,gender,age,photo,true]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users (เฉพาะผู้ที่ visible = true)
const getUsers = async (req,res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE visible=true ORDER BY age'
    );
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Search / Filter
const searchUsers = async (req,res) => {
  const { keyword, gender, faculty } = req.query;

  try {
    let query = 'SELECT * FROM users WHERE visible=true';
    let params = [];

    if(keyword) {
      params.push(`%${keyword}%`);
      query += ` AND username ILIKE $${params.length}`;
    }
    if(gender) {
      params.push(gender);
      query += ` AND gender=$${params.length}`;
    }
    if(faculty) {
      params.push(faculty);
      query += ` AND faculty=$${params.length}`;
    }

    query += ' ORDER BY age';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
const updateUser = async (req,res) => {
  const { id } = req.params;
  const { username,email,faculty,gender,age,photo } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET username=$1,email=$2,faculty=$3,gender=$4,age=$5,photo=$6 WHERE id=$7 RETURNING *',
      [username,email,faculty,gender,age,photo,id]
    );
    res.json(result.rows[0]);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

// Set visibility
const setVisibility = async (req,res) => {
  const { id } = req.params;
  const { visible } = req.body; // true / false

  try {
    const result = await pool.query(
      'UPDATE users SET visible=$1 WHERE id=$2 RETURNING *',
      [visible,id]
    );
    res.json(result.rows[0]);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, addUser, getUsers, searchUsers, updateUser, setVisibility };