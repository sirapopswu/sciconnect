const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(3000, () => console.log('Server running at http://localhost:3000'));