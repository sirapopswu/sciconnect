const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.addUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/visibility', userController.setUserVisibility);

module.exports = router;
