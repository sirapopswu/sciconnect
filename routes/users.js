const express = require('express');
const router = express.Router();
const { login, addUser, getUsers } = require('../controllers/users');

router.post('/login', login);
router.post('/', addUser);
router.get('/', getUsers);

module.exports = router;

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

// Set visibility
router.patch('/:id/visibility', setVisibility);

module.exports = router;