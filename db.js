const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',           // username ของกอล์ฟ
    host: 'localhost',
    database: 'sciconnect',     // ชื่อ Database
    password: 'yourpassword',   // password ของกอล์ฟ
    port: 5432,
});

module.exports = pool;