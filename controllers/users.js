// controllers/users.js
const pool = require('../db/connection'); 

//Login (fix)
const login = (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    })
  }

  const users = [
    { id: 1, email: 'test@test.com', password: '1234' }
  ]

  const user = users.find(u => u.email === email)

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    })
  }

  if (user.password !== password) {
    return res.status(401).json({
      message: 'Invalid password'
    })
  }

  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email
    }
  })
}

// module.exports = { login }

// Add user
const addUser = async (req, res) => {
  const { username, password, student_id, email, major, gender, age, photo, bio, skills, line_url, facebook_url, instagram_url } = req.body;

  if (!username) return res.status(400).json({ message: 'Missing username' });
  if (!password) return res.status(400).json({ message: 'Missing password' });
  if (!student_id) return res.status(400).json({ message: 'Missing student_id' });
  if (!gender) return res.status(400).json({ message: 'Missing gender' });

  const generation = student_id.substring(0, 2);

  try {
    const result = await pool.query(
      `INSERT INTO users 
       (username, password, student_id, generation, email, major, gender, age, photo, bio, skills, visible, line_url, facebook_url, instagram_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        username,
        password,
        student_id,
        generation,
        email,
        major,
        gender,
        age,
        photo || 'default.png',
        bio || '',
        skills || '[]', 
        true,
        line_url || '',
        facebook_url || '',
        instagram_url || ''
      ]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
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
      'SELECT id, username, email, major, gender, age, photo, bio, skills, line_url, facebook_url, instagram_url FROM users WHERE visible=true ORDER BY age'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search / Filter users
const searchUsers = async (req, res) => {
  const { keyword, gender, major } = req.query;

  try {
    let query = 'SELECT id, username, email, major, gender, age, photo, bio, skills, line_url, facebook_url, instagram_url FROM users WHERE visible=true';
    let params = [];

    if (keyword) {
      params.push(`%${keyword}%`);
      query += ` AND username ILIKE $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      query += ` AND gender=$${params.length}`;
    }
    if (major) {
      params.push(major);
      query += ` AND major=$${params.length}`;
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
  const { username, email, major, gender, age, photo, bio, skills, line_url, facebook_url, instagram_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, email=$2, major=$3, gender=$4, age=$5, photo=$6, bio=$7, skills=$8, line_url=$9, facebook_url=$10, instagram_url=$11
       WHERE id=$12 RETURNING *`,
      [username, email, major, gender, age, photo, bio, skills || '[]', line_url || '', facebook_url || '', instagram_url || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, addUser, getUsers, searchUsers, updateUser };
