const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create express app
const app = express();
const port = 3000;

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: { rejectUnauthorized: false }
});

// Process hook to shutdown pool 
process.on('SIGINT', function() {
  pool.end();
  console.log('Application successfully shutdown');
  process.exit(0);
});

// Configure EJS view engine (Slide 24)
app.set('view engine', 'ejs');

// Root route: queries PostgreSQL and renders via EJS (Slide 33-35)
app.get('/', (req, res) => {
  pool
    .query('SELECT menu_item_id, name, category, price FROM menu_item ORDER BY menu_item_id ASC;')
    .then(query_res => {
      const data = {
        items: query_res.rows,
        database: process.env.PSQL_DATABASE,
        host: process.env.PSQL_HOST
      };
      res.render('index', data);
    })
    .catch(err => {
      console.error('Database query error:', err);
      res.status(500).send('Database connection error: ' + err.message);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
