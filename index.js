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

const userRoutes = require('./routes/user.route');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
module.exports = app;

