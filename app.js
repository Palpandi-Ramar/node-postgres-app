const express = require('express');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

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

// help Page
app.get('/help', (req, res) => {
  res.render('help');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
