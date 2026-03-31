// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { login, addUser, getUsers, updateUser } = require('../controllers/users');

const app = express();
app.use(bodyParser.json());

// Routes
app.post('/login', login);
app.post('/users', addUser);
app.get('/users', getUsers);
app.put('/users/:id', updateUser);

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));