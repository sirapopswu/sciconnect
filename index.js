const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// บอก Express ให้โหลดไฟล์ static จาก public
app.use(express.static(path.join(__dirname, 'public')));

// API users
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));