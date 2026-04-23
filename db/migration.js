const pool = require('./connection');

function runMigration() {
  // Auto-migrate DB schema if needed
  return pool.query(
    `
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
`
  ).catch((e) => console.log('Migration note:', e.message));
}

module.exports = { runMigration };
