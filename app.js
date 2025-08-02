const express = require('express');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Ensure table exists before handling any requests
async function ensureTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS home_content (
        id SERIAL PRIMARY KEY,
        message TEXT
      );
    `);

    // Insert a default message if table is empty
    const result = await pool.query('SELECT COUNT(*) FROM home_content;');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      await pool.query(`INSERT INTO home_content (message) VALUES ($1);`, ['Welcome to Node + PostgreSQL!']);
      console.log('Default message inserted.');
    }
  } catch (err) {
    console.error('Error ensuring table exists:', err);
    process.exit(1); // Exit app if DB setup fails
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

//  Start server only after table check
ensureTableExists().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
