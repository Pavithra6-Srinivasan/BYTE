const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const sharp = require('sharp');



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
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE
    uri: process.env.JDBC_DATABASE_URL
});


pool.connect((err) => {
    if (err) {
        console.error('Error connecting to jawsdb:', err);
        return;
    }
    console.log('Connected to jawsdb');
});



// const pool = mysql.createConnection({
//     host: 'localhost',
//     user: 'sqluser',
//     password: 'password', 
//     database: 'byteusers'
// });

// .connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL');
// });



  const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


  const upload = multer({ storage });


// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-up.html'));
});

// account creation
app.post('/sign-up', (req, res) => {
    const { username, email, password } = req.body;

    console.log('Create Account Request:', req.body);

    // Account creation
    if (username && email && password) {
        console.log('checking username email and password');
        // Check if the username already exists
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

app.get('/upload2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload2.html'));
});

function generateToken(userId) {
  // Implement your token generation logic here
  // Example: using a crypto library to generate a random string
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
      const user = results[0]; // Assuming the first result is the user

      // Generate a token for the user
      const token = generateToken(user.id);

      // Store the token in the database (replace with your logic)
      const updateTokenQuery = 'UPDATE users SET token = ? WHERE id = ?';
      ensureUserDirectory(username);
    pool.query(updateTokenQuery, [token, user.id], (updateErr) => {
      if (updateErr) {
    console.error('Error storing token in user table:', updateErr);
    res.json({ success: false, message: 'Login successful, but token storage failed' });
    return;
  }

        // Respond with success and the generated token
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('graphic-tees-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
      res.render('graphic-tees', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('tops-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('tops', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('pants-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('pants', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('dresses-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('dresses', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('jeans-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('jeans', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('shorts-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('shorts', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('skirts-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('skirts', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('sweaters-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('sweaters', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('cardigans-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('cardigans', { products: results });
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

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('jackets-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('jackets', { products: results });
    }
  });
});








// Serve the HTML file
app.get('/upload', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

const moodboardsDir = path.join(__dirname, 'moodboards');

// Ensure that the 'moodboards' directory exists
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

// Save a moodboard for a user
// app.post('/save-moodboard', (req, res) => {
//   const { username, name, images } = req.body;
//   try {
//       ensureUserDirectory(username);

//       const fileName = `${name}.json`;
//       const filePath = path.join(moodboardsDir, username, fileName);
//       const moodboardData = { images };

//       fs.writeFile(filePath, JSON.stringify(moodboardData, null, 2), (err) => {
//           if (err) {
//               return res.status(500).send('Error saving moodboard');
//           }
//           res.send('Moodboard saved successfully');
//       });
//   } catch (error) {
//       res.status(400).send(error.message);
//   }
// });

app.post('/save-moodboard', (req, res) => {
  const { username, name, images } = req.body;
  try {
      ensureUserDirectory(username);

      const fileName = `${name}.json`;
      const filePath = path.join(moodboardsDir, username, fileName);
      const moodboardData = { images };

      fs.writeFile(filePath, JSON.stringify(moodboardData, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error saving moodboard');
          }
          res.send('Moodboard saved successfully');
      });
  } catch (error) {
      res.status(400).send(error.message);
  }
});

function ensureUserDirectory(username) {
  const userDir = path.join(moodboardsDir, username);
  if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
  }
}

// List moodboards for a user
app.get('/list-moodboards/:username', (req, res) => {
  const username = req.params.username;
  try {
      ensureUserDirectory(username);

      const userDir = path.join(moodboardsDir, username);
      fs.readdir(userDir, (err, files) => {
          if (err) {
              return res.status(500).send('Unable to scan directory');
          }
          const moodboards = files.map(file => path.parse(file).name);
          res.json(moodboards);
      });
  } catch (error) {
      res.status(400).send(error.message);
  }
});

// Fetch a specific moodboard for a user
app.get('/moodboard/:username/:name', (req, res) => {
  const { username, name } = req.params;
  try {
      ensureUserDirectory(username);

      const fileName = `${name}.json`;
      const filePath = path.join(moodboardsDir, username, fileName);

      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              return res.status(404).send('Moodboard not found');
          }
          res.json(JSON.parse(data));
      });
  } catch (error) {
      res.status(400).send(error.message);
  }
});



const User = require('./server/models/user');

app.use(session({
    secret: process.env.SESSION_SECRET || 'secretKey',
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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://glacial-coast-30522-eb4abac1d785.herokuapp.com/auth/google/callback'
    
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }));

// Route to start OAuth process
app.get('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
);


// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login.html' }),
//   (req, res) => {
//     // Successful authentication, redirect to main website page
//     res.redirect('/upload.html');
//   }
//   );


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Successful authentication
    const googleProfile = req.user; // Access user information from Google

    // Check if user with the email already exists
    const checkUserExists = async (email) => {
      // Implement your logic to check for existing user based on email
      const existingUser = await User.findOne({
        where: { email: email } // Filter by email
      });

      return existingUser ? true : false;
    };

    checkUserExists(googleProfile.emails[0].value)
      .then(userExists => {
        if (userExists) {
          console.log('User already exists:', googleProfile.emails[0].value);
          // User already exists, you can update the user information if needed
          // ... (logic to update user record if needed)
          // You can potentially redirect to the user's profile page here
          res.redirect('/upload.html'); // Or redirect to a relevant page
        } else {
          console.log('New user:', googleProfile.emails[0].value);
          // Create a new user record
          const newUser = new User({
            username: googleProfile.displayName || null, // Set username from Google profile (optional)
            email: googleProfile.emails[0].value || null, // Set email from Google profile (optional)
          });

          newUser.save() // Assuming 'save' is a method on your User model to persist data
            .then(createdUser => {
              console.log('User created successfully:', createdUser.dataValues);
              // (Optional) Generate your own internal token for the user
              // ... (logic for token generation)
              // Redirect to a relevant page (e.g., profile, deposit)
              res.redirect('/upload.html');
            })
            .catch(err => {
              console.error('Error creating user:', err);
              // Handle errors during user creation (e.g., display error message)
              res.status(500).send('Error creating user');
            });
        }
      })
      .catch(err => {
        console.error('Error checking for existing user:', err);
        // Handle errors during user existence check
        res.status(500).send('Error logging in');
      });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
