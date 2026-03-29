// Add user
const addUser = async (req, res) => {
  const { username, password, email, faculty, gender, age, photo, bio } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users 
       (username, password, email, faculty, gender, age, photo, bio, visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [username, password, email, faculty, gender, age, photo || 'default.png', bio || '', true]
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
      'SELECT id, username, email, faculty, gender, age, photo, bio FROM users WHERE visible=true ORDER BY age'
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
    let query = 'SELECT id, username, email, faculty, gender, age, photo, bio FROM users WHERE visible=true';
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
  const { username, email, faculty, gender, age, photo, bio } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, email=$2, faculty=$3, gender=$4, age=$5, photo=$6, bio=$7
       WHERE id=$8 RETURNING *`,
      [username, email, faculty, gender, age, photo, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};