const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/users.json');

// GET all users
router.get('/', (req, res) => {
  const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  res.json(users);
});

// POST new user
router.post('/', (req, res) => {
  const users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  res.status(201).json(newUser);
});

module.exports = router;