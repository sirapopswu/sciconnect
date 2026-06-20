const express = require('express');
const router = express.Router();
const { login, addUser, getUsers, searchUsers, updateUser } = require('../controllers/users');

// Login
router.post('/login', login);

// Add user
router.post('/', addUser);

// Get all users
router.get('/', getUsers);

// Search / Filter
router.get('/search', searchUsers);

// Update user
router.put('/:id', updateUser);

module.exports = router;