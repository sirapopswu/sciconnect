const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/connection'); // เชื่อม PostgreSQL จริง

// Auto-migrate DB schema if needed
pool.query(`
  ALTER TABLE users ALTER COLUMN age TYPE VARCHAR(255); 
  ALTER TABLE users ALTER COLUMN photo TYPE TEXT; 
  ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS line_url VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255);
  
  -- Migrate primary key to student_id if needed
  DO $$ 
  BEGIN 
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') = 'integer' THEN 
      ALTER TABLE users RENAME COLUMN id TO id_old;
      ALTER TABLE users ADD COLUMN id VARCHAR(255) UNIQUE;
      UPDATE users SET id = student_id;
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;
      ALTER TABLE users ADD PRIMARY KEY (id);
    END IF;
  END $$;
`)
  .catch(e => console.log('Migration note:', e.message));

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

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
      'SELECT id, username, student_id, LEFT(student_id, 2) AS generation, email, major, gender, age, photo, line_url, facebook_url, instagram_url FROM users WHERE visible=true ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET search/filter users
app.get('/api/users/search', async (req, res) => {
  const { keyword, gender, major, age, gen } = req.query;
  try {
    let query = 'SELECT id, username, email, major, gender, age, LEFT(student_id, 2) AS generation, photo, bio, skills, line_url, facebook_url, instagram_url FROM users WHERE visible=true';
    let params = [];

    if (keyword) {
      params.push(`%${keyword}%`);
      query += ` AND (LOWER(username) LIKE LOWER($${params.length}) OR LOWER(bio) LIKE LOWER($${params.length}))`;
    }
    if (gender) {
      params.push(gender);
      query += ` AND gender=$${params.length}`;
    }
    if (major) {
      params.push(major);
      query += ` AND major=$${params.length}`;
    }
    if (age) {
      params.push(age);
      query += ` AND age=$${params.length}`;
    }
    if (gen) {
      params.push(gen);
      query += ` AND LEFT(student_id, 2) = $${params.length}`;
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
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
      'SELECT id, username, student_id, LEFT(student_id, 2) AS generation, email, major, gender, age, photo, bio, skills, visible, line_url, facebook_url, instagram_url FROM users WHERE id=$1',
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
  const { username, student_id, password, email, major, gender, age, photo, line_url, facebook_url, instagram_url } = req.body;
  if (!username) return res.status(400).json({ message: 'Missing username' });
  if (!password) return res.status(400).json({ message: 'Missing password' });
  if (!student_id) return res.status(400).json({ message: 'Missing student_id' });
  if (!gender) return res.status(400).json({ message: 'Missing gender' });

  try {
    const result = await pool.query(
      `INSERT INTO users (id, username, student_id, password, email, major, gender, age, photo, visible, line_url, facebook_url, instagram_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [student_id, username, student_id, password, email, major, gender, age, photo || 'default.png', true, line_url || '', facebook_url || '', instagram_url || '']
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

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, student_id, password, email, major, gender, age, photo, bio, skills, line_url, facebook_url, instagram_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, student_id=$2, password=$3, email=$4, major=$5, gender=$6, age=$7, photo=$8, bio=$9, skills=$10, line_url=$11, facebook_url=$12, instagram_url=$13
       WHERE id=$14 RETURNING *`,
      [username, student_id, password, email, major, gender, age, photo, bio, skills || '[]', line_url || '', facebook_url || '', instagram_url || '', id]
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

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
module.exports = app;

