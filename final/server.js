const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const cors = require('cors'); 
const axios = require('axios');
const folderId = `folder-${Date.now()}`;

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);

const app = express();

app.set('view engine', 'ejs');
app.set('public', path.join(__dirname , 'public'));
require('dotenv').config();

const pool = mysql.createConnection({
  uri: process.env.JDBC_DATABASE_URL,
   waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 10000,
    
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to jawsdb:', err);
        return;
    }
    console.log('Connected to jawsdb');
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-up.html'));
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
      // User is authenticated
      return next();
  } else {
      // User is not authenticated
      res.redirect('/login.html'); // Redirect to login page
  }
}

// Apply the middleware to routes that require authentication
app.get('/saved', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'saved.html'));
});


// ACCOUNT CREATION
app.post('/sign-up', (req, res) => {
    const { username, email, password } = req.body;

    console.log('Create Account Request:', req.body);

    if (username && email && password) {
        console.log('checking username email and password');
        // CHECK IF USERNAME ALREADY EXISTS
        const userExists = 'SELECT * FROM users WHERE username = ?';
        console.log('selecting from database');
        pool.query(userExists, [username], (err, results) => {
            console.log('before if');
            if (err) {
                console.log('after if');
                console.error('Error querying database:', err);
                console.log('error querying database');
                res.json({ success: false, message: 'Database error' });
                return;
            }
            console.log('after if err');

            if (results.length > 0) {
                console.log('results length > 0');
                res.json({ success: false, message: 'Username already taken' });
            } else {
                console.log('before insert query');
                const queryInsertUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
                console.log('after insert query');
                pool.query(queryInsertUser, [username, email, password], (err, result) => {
                    if (err) {
                        console.error('Error inserting into database:', err);
                        console.log('error inserting into database');
                        res.json({ success: false, message: 'Database error' });
                        return;
                    }
                    console.log('no error inserting into db');
                    res.json({ success: true, message: 'Account created successfully!' });
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


function generateToken(userId) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login Request:', req.body);

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  pool.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.json({ success: false, message: 'Database error' });
      return;
    }
    if (results.length > 0) {
      const user = results[0];

      const token = generateToken(user.id);

      const updateTokenQuery = 'UPDATE users SET token = ? WHERE id = ?';
      ensureUserDirectory(username);
    pool.query(updateTokenQuery, [token, user.id], (updateErr) => {
      if (updateErr) {
    console.error('Error storing token in user table:', updateErr);
    res.json({ success: false, message: 'Login successful, but token storage failed' });
    return;
  }

    res.json({ success: true, message: 'Login successful!', token });
    });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/graphic-tees', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'graphic tees'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }


  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }

  
  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('graphic-tees-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('graphic-tees', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/sandals', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'sandals'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('sandals-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('sandals', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/shoes', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'shoes'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('shoes-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('shoes', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/jewellery', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'jewellery'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('jewellery-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('jewellery', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/tops', (req, res) => {
  const { search, colour, minPrice, maxPrice , gender} = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'tops'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }

  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('tops-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('tops', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/pants', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender} = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'pants'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('pants-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('pants', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/dresses', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'dresses'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('dresses-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('dresses', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/jeans', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'jeans'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('jeans-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('jeans', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/shorts', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'shorts'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('shorts-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('shorts', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/skirts', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'skirts'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('skirts-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('skirts', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/sweaters', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'sweaters'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('sweaters-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('sweaters', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
 
});

app.get('/cardigans', (req, res) => {
  const { search, colour, minPrice, maxPrice, gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'cardigans'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('cardigans-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('cardigans', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

app.get('/jackets', (req, res) => {
  const { search, colour, minPrice, maxPrice,gender } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg, gender FROM cottonon WHERE category = 'jackets'";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }
  if (colour) {
    query += " AND JSON_CONTAINS(colour, ?)";
    params.push(`"${colour}"`);
  }
  if (minPrice) {
    query += " AND pricing >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }
  if (gender) {
    query += " AND gender = ?";
    params.push(gender);
  }

  pool.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }
  
    const selectedGender = req.query.gender || '';
    const selectedColour = req.query.colour || '';
  
    if (req.xhr) {
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('jackets-list', { products: results, selectedGender: selectedGender, selectedColour: selectedColour }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
      res.render('jackets', { products: results, selectedGender: selectedGender, selectedColour: selectedColour });
    }
  });
  
});

const moodboardsDir = path.join(__dirname, 'moodboards');

if (!fs.existsSync(moodboardsDir)) {
    fs.mkdirSync(moodboardsDir);
}

function ensureUserDirectory(username) {
  if (!username) {
      throw new Error('Username is required');
  }
  const userDir = path.join(moodboardsDir, username);
  if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
  }
}

app.post('/save-moodboard', (req, res) => {
    const { username, name, images } = req.body;

    const userQuery = 'SELECT id FROM users WHERE username = ?';
    pool.query(userQuery, [username], (err, userResult) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Error fetching user');
            return;
        }

        if (userResult.length === 0) {
            res.status(404).send('User not found');
            return;
        }

        const userId = userResult[0].id;

        const imagePaths = images.map((image, index) => ({
          src: image.src,
          position: image.position
      }));

        const imagesJson = JSON.stringify(imagePaths);

        const insertMoodboardQuery = 'INSERT INTO moodboards (user_id, title, images) VALUES (?, ?, ?)';
        pool.query(insertMoodboardQuery, [userId, name, imagesJson], (err, result) => {
            if (err) {
                console.error('Error saving moodboard:', err);
                res.status(500).send('Error saving moodboard');
                return;
            }

            res.send('Moodboard saved successfully');
        });
    });
});

function ensureUserDirectory(username) {
  const userDir = path.join(moodboardsDir, username);
  if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
  }
}

app.get('/list-moodboards/:username', (req, res) => {
  const username = req.params.username;
  
  const userQuery = 'SELECT id FROM users WHERE username = ?';
  pool.query(userQuery, [username], (err, userResult) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user');
      return;
    }

    if (userResult.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const userId = userResult[0].id;
    const moodboardsQuery = 'SELECT id, title FROM moodboards WHERE user_id = ?';
    pool.query(moodboardsQuery, [userId], (err, moodboardsResult) => {
      if (err) {
        console.error('Error fetching moodboards:', err);
        res.status(500).send('Error fetching moodboards');
        return;
      }

      res.json(moodboardsResult);
    });
  });
});


app.get('/moodboard/:username/:moodboardId', (req, res) => {
  const { username, moodboardId } = req.params;

  const moodboardQuery = `
    SELECT m.title, m.images
    FROM moodboards m
    JOIN users u ON m.user_id = u.id
    WHERE u.username = ? AND m.id = ?`;

  pool.query(moodboardQuery, [username, moodboardId], (err, moodboardResult) => {
    if (err) {
      console.error('Error fetching moodboard:', err);
      res.status(500).send('Error fetching moodboard');
      return;
    }

    if (moodboardResult.length === 0) {
      res.status(404).send('Moodboard not found');
      return;
    }

    res.json(moodboardResult[0]);
  });
});

app.get('/get-moodboard/:moodboardId', (req, res) => {
  const { moodboardId } = req.params;
  console.log('Received moodboardId:', moodboardId); // Debugging log

  const query = 'SELECT images FROM moodboards WHERE id = ?';

  pool.query(query, [moodboardId], (err, results) => {
      if (err) {
          console.error('Error fetching moodboard:', err);
          return res.status(500).json({ success: false, message: 'Server error.' });
      }

      console.log('Query result:', results); 

      if (results.length > 0) {
          let images = results[0].images;
          console.log('Raw images data:', images);
          res.json({ success: true, moodboard: images });
      } else {
          res.json({ success: false, message: 'Moodboard not found.' });
      }
  });
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
  });

app.use(cors());

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
      return res.status(400).send('URL is required');
  }

  console.log('Proxy URL:', decodeURIComponent(imageUrl));

  try {
      const response = await axios({
          url: decodeURIComponent(imageUrl),
          method: 'GET',
          responseType: 'arraybuffer' 
      });

      res.set('Content-Type', response.headers['content-type']);
      res.send(response.data);
  } catch (error) {
      console.error('Error fetching the image:', error);
      res.status(500).send('Error fetching the image');
  }
});

const User = require('./server/models/user');
  
  //SESSION
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretKey',
    resave: false,
    saveUninitialized: true
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URL,
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const googleId = profile.id;
  
    pool.query('SELECT * FROM users WHERE google_id = ?', [googleId], (err, rows) => {
      if (err) return done(err);
  
      if (rows.length > 0) {
        return done(null, rows[0]);
      } else {
        pool.query('INSERT INTO users (google_id, email) VALUES (?, ?)', [googleId, email], (err, result) => {
          if (err) return done(err);
  
          pool.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err, newRows) => {
            if (err) return done(err);
  
            return done(null, newRows[0]);
          });
        });
      }
    });
  }));

// ROUTE TO START AUTH PROCESS
app.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login.html' }), 
  (req, res) => {
    const user = req.user;
    console.log('User after authentication:', user);

    const userInfo = {
      username: user.username, // Storing email as username
    };

    const userInfoStr = Buffer.from(JSON.stringify(userInfo)).toString('base64');
    res.redirect(`/set-session?user=${userInfoStr}`);
  }
);

// Set Session Route
app.get('/set-session', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'set-session.html'));
});

  // LOGOUT
app.get('/logout', (req, res) => {
req.logout();
res.redirect('/login.html');
});

  // CHECK IF USER IS ALREADY LOGGED IN
app.get('/profile', (req, res) => {
if (!req.isAuthenticated()) {
  return res.status(401).send('You are not authenticated');
}
res.send(req.user);
});

app.get('/check-moodboard-name/:username/:name', (req, res) => {
  const { username, name } = req.params;

  // Use pool.query to execute the query
  pool.query(
      'SELECT * FROM moodboards WHERE user_id = (SELECT id FROM users WHERE username = ?) AND title = ?',
      [username, name],
      (err, results) => {
          if (err) {
              console.error('Error executing query:', err);
              return res.status(500).json({ error: 'Error checking moodboard name' });
          }

          res.json({ exists: results.length > 0 });
      }
  );
});

app.get('/finspo', (req, res) => {
  pool.query('SELECT id, image_url FROM finspo', (error, results) => {
    if (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images');
      return;
    }
    const images = results;
    res.render('finspo', { images });
  });
});

app.get('/minspo', (req, res) => {
  pool.query('SELECT id, image_url FROM minspo', (error, results) => {
    if (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Error fetching images');
      return;
    }
    const images = results;
    res.render('minspo', { images });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
