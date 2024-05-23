const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Replace with your actual MySQL connection details
const pool = mysql.createPool({
  host: 'localhost',
  user: 'sqluser',
  password: 'password',
  database: 'byteusers'
});



// Route to display create account form
app.get('/create-account', (req, res) => {
  // Serve your create-account.html page here (replace with your path)
  res.sendFile(__dirname + '/create-account.html');
});

// Route to display login form
app.get('/login', (req, res) => {
  // Serve your login.html page here (replace with your path)
  res.sendFile(__dirname + '/login.html');
});

// Route to handle login request
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const connection = await pool.getConnection();
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

// Route to handle account creation request
app.post('/create-account', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password; // Consider using password hashing for security

  try {
    const connection = await pool.getConnection();

    // Validate username uniqueness (optional)
    const [usernameExists] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    if (usernameExists.length > 0) {
      return res.json({ success: false, error: 'Username already exists' });
    }

    // Hash password before storing (recommended)
    const hashedPassword = await bcrypt.hash(password, 10); // Replace with actual hashing logic

    const [result] = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    connection.release();

    if (result.affectedRows === 1) {
      // Account created successfully (replace with actual success logic)
      res.json({ success: true });
    } else {
      // Account creation failed (replace with actual error message)
      res.json({ success: false, error: 'Account creation failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
