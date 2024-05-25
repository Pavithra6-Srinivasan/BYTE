const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = 3000;


app.use('/static', express.static(path.join(process.cwd(), 'public')));

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Replace with your actual MySQL connection details
const pool = mysql.createPool({
  host: 'localhost',
  user: 'sqluser',
  password: 'password',
  database: 'byteusers'
});

// Route to display the form
app.get('/create-account', (req, res) => {
  res.sendFile(__dirname + '/create-account3.html');
});

app.get('/public/script.js', (req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  res.sendFile(__dirname + '/public/script.js');
});

app.get('/public/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(__dirname + '/public/style.css');
});


// Route to handle form submission
app.post('/submit', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO users (username, email,password) VALUES (?, ?, ?)', [username, email,password]);

    connection.release();
    res.send('Account created!');
    res.redirect('login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to create account');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

//Route to handle login
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const connection = await pool.getConnection();

    // Replace with your actual query to validate username and password against database
    const [result] = await connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    connection.release();

    if (result.length > 0) {
      // Login successful (replace with actual success logic)
      res.json({ success: true });
    } else {
      // Login failed (replace with actual error message)
      res.json({ success: false, error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));