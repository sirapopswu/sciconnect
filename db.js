const { Pool } = require('pg');

const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sciconnect',
  password: process.env.DB_PASSWORD || '17112548',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
};

const pool = new Pool(poolConfig);

module.exports = pool;