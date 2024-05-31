const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();


const db = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser',
    password: 'password', // Replace with your MySQL root password
    database: 'byteusers'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});


// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/deposit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'deposit.html'));
});


// Serve the main page
app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-up.html'));
});

// Handle account creation
app.post('/sign-up', (req, res) => {
    const { username, email, password } = req.body;

    console.log('Create Account Request:', req.body);

    // Implement your account creation logic here
    if (username && email && password) {
        // Check if the username already exists
        const userExists = 'SELECT * FROM users WHERE username = ?';
        db.query(userExists, [username], (err, results) => {
            if (err) {
                console.error('Error querying database:', err);
                res.json({ success: false, message: 'Database error' });
                return;
            }

            if (results.length > 0) {
                res.json({ success: false, message: 'Username already taken' });
            } else {
                const queryInsertUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
                db.query(queryInsertUser, [username, email, password], (err, result) => {
                    if (err) {
                        console.error('Error inserting into database:', err);
                        res.json({ success: false, message: 'Database error' });
                        return;
                    } 
                    res.json({ success: true, message: 'Account created successfully!' });
                    //res.redirect('/login.html');
                    
                    
                });
            }
        });
    } else {
        res.json({ success: false, message: 'Invalid input data' });
    }
   
});
        
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login Request:', req.body);

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.json({ success: false, message: 'Database error' });
            return;
        }
       
        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful!' });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});




const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});