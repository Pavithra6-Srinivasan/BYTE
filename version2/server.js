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

const db = mysql.createConnection({
    host: 'localhost',
    user: 'sqluser',
    password: 'password', 
    database: 'byteusers'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  const resizeImage = (inputPath, maxWidth, maxHeight) => {
    return sharp(inputPath)
      .resize({ 
        fit: 'inside',
        width: maxWidth,
        height: maxHeight,
        withoutEnlargement: true
      })
      .toBuffer();
  };
  

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
  db.query(query, [username, password], (err, results) => {
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
    db.query(updateTokenQuery, [token, user.id], (updateErr) => {
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

app.get('/products', (req, res) => {
  const { search, colour, minPrice, maxPrice } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'graphictees'";
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

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('product-list', { products: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
      res.render('products', { products: results });
    }
  });
});

app.get('/products2', (req, res) => {
  const { search, colour, minPrice, maxPrice } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'tops'";
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

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('product-list2', { products2: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('products2', { products2: results });
    }
  });
});

app.get('/products3', (req, res) => {
  const { search, colour, minPrice, maxPrice } = req.query;

  let query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'pants'";
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

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching cottonon:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }

    if (req.xhr) {
      // If the request is AJAX, send only the product list HTML
      res.render('product-list3', { products3: results }, (err, html) => {
        if (err) {
          console.error('Error rendering product list:', err);
          res.status(500).send('Error rendering product list');
          return;
        }
        res.send(html);
      });
    } else {
      // If not an AJAX request, render the full page
     res.render('products3', { products3: results });
    }
  });
});




// // Example route to render product list
// app.get('/products', (req, res) => {
//   const query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'graphictees'";


//   db.query(query, (error, results) => {
//     if (error) {
//       console.error('Error fetching cotton:', error);
//       res.status(500).send('Error fetching cottonon');
//       return;
//     }

//     // Render product-list.ejs with products data
//     res.render('products', { products: results });
//   });
// });

app.get('/products2', (req, res) => {
  const query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'tops'";

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching cotton:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }

    // Render product-list.ejs with products data
    res.render('products2', { products2: results });
  });
});


// app.post('/upload', upload.array('images', 10), async (req, res) => {
//   const maxWidth = 800; // Maximum width of resized image
//   const maxHeight = 600; // Maximum height of resized image

//   try {
//     const uploadPromises = req.files.map(async (file) => {
//       const imgPath = file.path;
//       const resizedImgBuffer = await resizeImage(imgPath, maxWidth, maxHeight);
//       const encodedImg = resizedImgBuffer.toString('base64');

//       // Store image in MySQL
//       const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
//       return new Promise((resolve, reject) => {
//         db.query(sql, [folderId, encodedImg], (err, result) => {
//           if (err) reject(err);
//           resolve(`data:image/jpeg;base64,${encodedImg}`);
//         });
//       }).finally(() => {
//         // Asynchronously delete the uploaded file
//         fs.unlink(imgPath, (err) => {
//           if (err) {
//             console.error(`Failed to delete file: ${imgPath}`, err);
//           }
//         });
//       });
//     });

//     const results = await Promise.all(uploadPromises);
//     res.json({ folderId, images: results });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error processing images');
//   }
// });


// Route to add image from URL
// Route to add image from URL
// Route to add image from URL
// app.post('/add-url-image', async (req, res) => {
//   const { url } = req.body;
  
//   try {
//     const fetch = await import('node-fetch');
//     const response = await fetch.default(url); // Note the use of .default
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const encodedImg = buffer.toString('base64');

//     // Store image in MySQL
//     const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
//     db.query(sql, [folderId, encodedImg], (err, result) => {
//       if (err) throw err;
//       res.json({ folderId, imageUrl: `data:image/jpeg;base64,${encodedImg}` });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error fetching image from URL');
//   }
// });



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
// app.get('/auth/google/callback',
// passport.authenticate('google', { failureRedirect: '/login.html' }),
// (req, res) => {
//   // Successful authentication, redirect to main website page
//   res.redirect('/deposit.html');
// }
// );



app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Successful authentication
    const googleProfile = req.user; // Access user information from Google

    // Check if user with the Google ID already exists
    
    const checkUserExists = async (googleId) => {
      // Implement your logic to check for existing user based on googleId
      // This could involve a database query using your ORM or raw SQL
      
      const existingUser = await User.findOne({
        where: { google_id: googleId } // Filter by google_id
      });
      
      return existingUser ? true : false;
    };

    checkUserExists(googleProfile.id)
      .then(userExists => {
        if (userExists) {
          console.log('User already exists:', googleProfile.id);
          // User already exists, update google_id if needed (optional)
          // ... (logic to update user record if needed)
          // You can potentially redirect to the user's profile page here
          res.redirect('/upload.html'); // Or redirect to a relevant page
        } else {
          console.log('New user:', googleProfile.id);
          // Create a new user record
          const newUser = new User({
              username: googleProfile.displayName || null, // Set username from Google profile (optional)
              email: googleProfile.emails[0].value || null, // Set email from Google profile (optional)
              google_id: googleProfile.id
          });

          newUser.save() // Assuming 'save' is a method on your User model to persist data
            .then(createdUser => {
              console.log('User created successfully:', createdUser.dataValues);
              // (Optional) Generate your own internal token for the user
              // ... (logic for token generation)
              // Redirect to a relevant page (e.g., profile, deposit)
              res.redirect('/deposit.html');
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});