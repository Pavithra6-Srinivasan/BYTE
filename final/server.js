const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const sharp = require('sharp');
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
    connectionLimit: 10,
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

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
}
});

const upload = multer({ storage });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


 



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign-up.html'));
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

app.get('/upload2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload2.html'));
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
      // IF REQUEST IS AJAX, ONLY THE PRODUCT LIST
      res.render('graphic-tees-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // IF NOT, FULL PAGE
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
      res.render('tops-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('pants-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('dresses-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('jeans-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('shorts-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('skirts-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('sweaters-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('cardigans-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
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
      res.render('jackets-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
     res.render('jackets', { products: results });
    }
  });
});

app.get('/upload', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'upload.html'));
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

        // const imagePaths = images.map((image, index) => {
        //   const base64Data = image.src.replace(/^data:image\/\w+;base64,/, "");
        //   const extension = image.src.split(';')[0].split('/')[1];
        //   const filePath = path.join(uploadDir, `moodboard_${username}_${Date.now()}_${index}.${extension}`);

        //   fs.writeFileSync(filePath, base64Data, 'base64');
        //   return { path: filePath, position: image.position };
        // });

        const imagesJson = JSON.stringify(imagePaths);




      //  const imagesJson = JSON.stringify(images);

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

app.use(cors()); // Enable CORS for all routes

app.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer' // This allows us to handle binary data
        });

        // Set the appropriate headers for the response
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the image:', error);
        res.status(500).send('Error fetching the image');
    }
});

// app.get('/recommendations', async (req, res) => {
//   const color = req.query.color;

//   try {
//     // Query to fetch recommendations based on the color category
//     const query = `
//       SELECT title, img 
//       FROM cottonon 
//       WHERE color LIKE '%"${color}"%';
//     `;
//     const [rows] = await pool.query(query, [color]);

//     res.json(rows);
//   } catch (error) {
//     console.error('Error fetching recommendations:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //callbackURL: 'https://localhost:3000/auth/google/callback',
    callbackURL: 'https://glacial-coast-30522-eb4abac1d785.herokuapp.com/auth/google/callback'
    
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }));

// ROUTE TO START AUTH PROCESS
app.get('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
);


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Successful authentication, redirect to main website page
    res.redirect('/upload.html');
  }
  );



// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login.html' }),
//   (req, res) => {
//     // SUCESSFUL AUTHENTICATION
//     const googleProfile = req.user;

//     // CHECK IF USER WITH EMAIL ALREADY EXISTS
//     const checkUserExists = async (email) => {
//       const existingUser = await User.findOne({
//         where: { email: email } 
//       });
//       return existingUser ? true : false;
//     };

//     checkUserExists(googleProfile.emails[0].value)
//       .then(userExists => {
//         if (userExists) {
//           console.log('User already exists:', googleProfile.emails[0].value);
//           res.redirect('/upload.html');
//         } else {
//           console.log('New user:', googleProfile.emails[0].value);
//           // CREATE NEW USER
//           const newUser = new User({
//             username: googleProfile.displayName || null, 
//             email: googleProfile.emails[0].value || null, 
//           });

//           newUser.save() 
//             .then(createdUser => {
//               console.log('User created successfully:', createdUser.dataValues);
//               res.redirect('/upload.html');
//             })
//             .catch(err => {
//               console.error('Error creating user:', err);
//               res.status(500).send('Error creating user');
//             });
//         }
//       })
//       .catch(err => {
//         console.error('Error checking for existing user:', err);
//         res.status(500).send('Error logging in');
//       });
//   }
// );

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


app.get('/images', (req, res) => {
  pool.query('SELECT id, image_url FROM finspo', (error, results) => {
      if (error) {
          console.error('Error fetching images:', error);
          res.status(500).send('Error fetching images');
          return;
      }

      let html = `
          <html>
              <head>
                  <title>Image Gallery</title>
                  <style>
                      .gallery {
                          display: flex;
                          flex-wrap: wrap;
                      }
                      .gallery div {
                          margin: 10px;
                          text-align: center;
                      }
                      .gallery img {
                          max-width: 200px;
                          height: auto;
                      }
                  </style>
              </head>
              <body>
                  <h1>Image Gallery</h1>
                  <div class="gallery">
      `;

      results.forEach(row => {
          html += `
              <div>
                  <img src="${row.image_url}" alt="Image ${row.id}">
                  <p>ID: ${row.id}</p>
              </div>
          `;
      });

      html += `
                  </div>
              </body>
          </html>
      `;

      res.send(html);
  });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

