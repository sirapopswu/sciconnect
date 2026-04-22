const pool = require('./db');

pool.query('SELECT 1')
  .then(() => {
    console.log('DB CONNECT OK');
  })
  .catch(err => {
    console.error('DB ERROR:', err.message);
  });