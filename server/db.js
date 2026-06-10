// db.js or server.js
const { Pool } = require('pg');
require('dotenv').config(); // Make sure this package is installed: npm install dotenv

const pool = new Pool({
  // Use the database URL provided by the host environment, fallback to local if developer testing
  connectionString: process.env.DATABASE_URL, 
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

module.exports = pool;