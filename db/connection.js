// db/connection.js
const { Pool } = require('pg');

// กำหนด config การเชื่อมต่อ PostgreSQL
const pool = new Pool({
  user: 'postgres',        // ชื่อ user ของ PostgreSQL
  host: 'localhost',       // host ของ DB
  database: 'sciconnect',  // ชื่อ database จริงที่สร้างใน pgAdmin
  password: '392547',// รหัสผ่าน PostgreSQL ของคุณ
  port: 5432,              // port ปกติของ PostgreSQL
});

// ตรวจสอบการเชื่อมต่อ (optional แต่ช่วย debug)
pool.connect()
  .then(() => console.log('PostgreSQL connected successfully'))
  .catch(err => console.error('PostgreSQL connection error', err));

module.exports = pool;