const express = require('express');
const cors = require('cors');
const path = require('path');
const { runMigration } = require('./db/migration');
const userRoutes = require('./routes/user.route');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route => ส่งหน้า home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// API routes
app.use('/api/users', userRoutes);

// Auto-migrate DB schema if needed
runMigration();

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`),
  );
}

module.exports = app;
