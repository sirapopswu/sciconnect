const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/connection'); // เชื่อม PostgreSQL จริง

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route => ส่งหน้า home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// API routes

// GET all visible users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, major, gender, age, photo FROM users WHERE visible=true ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single user by id
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, username, email, major, gender, age, photo, visible FROM users WHERE id=$1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add user
app.post('/api/users', async (req, res) => {
  const { username, password, email, major, gender, age, photo } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing username or password' });

  try {
    const result = await pool.query(
      `INSERT INTO users (username, password, email, major, gender, age, photo, visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [username, password, email, major, gender, age, photo || 'default.png', true]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Username หรือ Email ถูกใช้แล้ว' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  // admin hardcode
  if (email === 'admin@gmail.com' && password === 'hardcode') {
    return res.json({ success: true, role: 'admin' });
  }

  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userExist.rows.length === 0) return res.status(401).json({ success: false, message: 'ไม่พบอีเมลนี้ในระบบ' });

    const user = userExist.rows[0];
    if (user.password !== password) return res.status(401).json({ success: false, message: 'รหัสไม่ถูกต้อง' });
    if (!user.visible) return res.status(403).json({ success: false, message: 'บัญชีนี้ถูกระงับหรือตั้งค่าเป็นไม่เปิดเผย' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, email, major, gender, age, photo, bio, skills } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, password=$2, email=$3, major=$4, gender=$5, age=$6, photo=$7, bio=$8, skills=$9
       WHERE id=$10 RETURNING *`,
      [username, password, email, major, gender, age, photo, bio, skills || '[]', id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH set user visibility
app.patch('/api/users/:id/visibility', async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET visible=$1 WHERE id=$2 RETURNING *',
      [visible !== undefined ? visible : true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));