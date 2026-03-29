// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/connection'); // เชื่อม PostgreSQL จริง

const app = express();
app.use(cors());
app.use(express.json());

// โหลดไฟล์ static จาก public
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// GET /api/users => ดึง user ทั้งหมดที่ visible
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, faculty, gender, age, photo FROM users WHERE visible=true ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users => เพิ่ม user
app.post('/api/users', async (req, res) => {
  const { username, password, email, faculty, gender, age, photo } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (username, password, email, faculty, gender, age, photo, visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [username, password, email, faculty, gender, age, photo || 'default.png', true]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Username หรือ Email นี้ถูกใช้ไปแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/login => login
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

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
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id => update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, email, faculty, gender, age, photo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, password=$2, email=$3, faculty=$4, gender=$5, age=$6, photo=$7
       WHERE id=$8 RETURNING *`,
      [username, password, email, faculty, gender, age, photo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/visibility => set visibility
app.patch('/api/users/:id/visibility', async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET visible=$1 WHERE id=$2 RETURNING *',
      [visible !== undefined ? visible : true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));