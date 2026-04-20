# sciconnect-server Backend Documentation

## 📌 Overview
Backend ของโปรเจกต์ SciConnect ใช้ **Express.js** และ **PostgreSQL**  
รองรับการจัดการผู้ใช้ (CRUD), Authentication และ API สำหรับเชื่อม frontend

---

## Database Access

**Database:** PostgreSQL  
**Database Name:** `sciconnect-server`  
**Table:** `users`

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(500) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    major VARCHAR(100),
    gender VARCHAR(100),
    age INT,
    photo VARCHAR(255),
    bio TEXT,
    skills JSONB DEFAULT '[]',
    visible BOOLEAN DEFAULT TRUE,
    line_url VARCHAR(255),
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);.
โค้ดเพิ่มจากอันเก่า
ALTER TABLE users
ADD COLUMN line_url VARCHAR(255),
ADD COLUMN facebook_url VARCHAR(255),
ADD COLUMN instagram_url VARCHAR(255);

## Connection Example (`db/connection.js`)

```js
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sciconnect-server',
  user: 'postgres',
  password: 'your_password_here'
});
module.exports = pool; ```

```
## ข้อจำกัด / สิ่งที่ยังไม่ทำ

Password ยัง plain text → ห้ามใช้ production จริง
รูปภาพยัง ใช้ชื่อหลอก ๆ → ต้องทำระบบ upload จริงต่อ
Validation ยังไม่ครบ (email ซ้ำ / username ซ้ำ)
Delete / Security / Unit Test ยังต้องทำต่อ

## Tips สำหรับทีม

- ใส่ DB access ของตัวเองใน `db/connection.js`
- ใช้ API ตามตาราง spec ด้านบน
- ระวัง field ที่ยังไม่ได้ validation / hashing
- สามารถทดสอบด้วย Thunder Client หรือ fetch API จาก frontend

## Running the server

# ติดตั้ง dependencies
npm install

# รัน server
node index.js

# server จะรันที่
http://localhost:3000
