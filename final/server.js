const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser',
    password: 'password', 
    database: 'byte'
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


// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// account creation
app.post('/index', (req, res) => {
    const { username, email, password } = req.body;

    console.log('Create Account Request:', req.body);

    // Account creation
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
                });
            }
        });
    } else {
        res.json({ success: false, message: 'Invalid input data' });
    }
});
        
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
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

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
  }));
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new GoogleStrategy({
    clientID: '871964147620-3eoiitmpqou6hec1hptos4vgeoeugp4s.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }));

// Route to start OAuth process
app.get('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
);

// Route for Google callback
app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/login.html' }),
(req, res) => {
  // Successful authentication, redirect to main website page
  res.redirect('/deposit.html');
}
);

// Route to handle logout
app.get('/logout', (req, res) => {
req.logout();
res.redirect('/login.html');
});

// Route to check if the user is logged in
app.get('/profile', (req, res) => {
if (!req.isAuthenticated()) {
  return res.status(401).send('You are not authenticated');
}
res.send(req.user);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
