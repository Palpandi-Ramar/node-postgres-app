const express = require('express');
const pool = require('./db');
const { Client } = require('@opensearch-project/opensearch');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Initialize OpenSearch client
const osClient = new Client({
  node: process.env.OPENSEARCH_HOST, //  Replace this
  auth: {
    username: process.env.OPENSEARCH_USERNAME, //  Replace with OpenSearch username
    password: process.env.OPENSEARCH_PASSWORD, //  Replace with OpenSearch password
  },
  ssl: {
    rejectUnauthorized: false // If using self-signed certs (for dev only)
  }
});

// Ensure table exists before handling any requests
async function ensureTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS home_content (
        id SERIAL PRIMARY KEY,
        message TEXT
      );
    `);

    const result = await pool.query('SELECT COUNT(*) FROM home_content;');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      await pool.query(`INSERT INTO home_content (message) VALUES ($1);`, ['Welcome to Node + PostgreSQL!']);
      console.log('Default message inserted.');
    }
  } catch (err) {
    console.error('Error ensuring table exists:', err);
    process.exit(1);
  }
}

// Home Page - Fetch dynamic content
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT message FROM home_content LIMIT 1;');
    const message = result.rows[0] ? result.rows[0].message : "No content found";
    res.render('index', { message });
  } catch (err) {
    console.error(err);
    res.send("Error fetching data");
  }
});

// About Page
app.get('/about', (req, res) => {
  res.render('about');
});

// Help Page
app.get('/help', (req, res) => {
  res.render('help');
});

//  Add this test route for OpenSearch connection check
app.get('/opensearch-test', async (req, res) => {
  try {
    const info = await osClient.info();
    console.log('OpenSearch Info:', info.body);
    res.send(' OpenSearch connection successful!');
  } catch (err) {
    console.error(' OpenSearch connection failed:', err);
    res.status(500).send(' Failed to connect to OpenSearch');
  }
});

// Start server only after DB check
ensureTableExists().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
