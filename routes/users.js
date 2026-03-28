// routes/users.js
const express = require('express');
const router = express.Router();
const { login, addUser, getUsers, searchUsers, updateUser, setVisibility } = require('../controllers/users');

// Route mapping
router.post('/login', login);          // เข้าระบบ
router.post('/', addUser);             // เพิ่ม user
router.get('/', getUsers);             // ดู user ทั้งหมด
router.get('/search', searchUsers);    // Search / Filter
router.put('/:id', updateUser);        // แก้ไขข้อมูลตัวเอง
router.put('/:id/visibility', setVisibility); // ตั้ง visible true/false

module.exports = router;