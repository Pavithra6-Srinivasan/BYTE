const db = require('../config/db');

const signUp = (req, res) => {
    const { username, email, password } = req.body;

    console.log('Create Account Request:', req.body);

    if (username && email && password) {
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
};

const login = (req, res) => {
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
};

module.exports = { signUp, login };
