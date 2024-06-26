const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
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
const process = require('process');

//You can connect to your JawsDB database using Node.js via the node-mysql module. Below is an example of how to do this using the environment variable that is set automatically by JawsDB.




const sslCertPath = path.join(__dirname, 'rds-combined-ca-bundle.pem');

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      ca: fs.readFileSync(sslCertPath), // Ensure you have correct path here
    }
});

pool.getConnection((err, connection) => {
  if (err) {
      console.error('Database connection failed:', err);
      alert('connection failed');
  } else {
      console.log('Connected to database!');
      // Use connection for querying
  }    
});
  
async function testConnection() {
  try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query('SELECT 1 + 1 AS solution');
      console.log('The solution is: ', rows[0].solution);
      connection.release();
  } catch (err) {
      console.error('Database connection failed:', err);
  }
}

testConnection();

// Export connection for our ORM to use.


// require('dotenv').config();


// const pool = mysql.createPool({
//   host: 'dyud5fa2qycz1o3v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
//   user: 'k7usqcqczzkuu27d',
//   password: 'p0h6237jf2glix8k',
//   database: 'cgollfbrtgl7ctd1',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Database connection failed:', err);
//   } else {
//     console.log('Connected to database!');
//     connection.release(); // Release the connection
//   }
// });

/*const pool = mysql.createPool({
  host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
 });*/



app.set('view engine', 'ejs');
app.set('public', path.join(__dirname , 'public'));

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

// Example route to render product list
app.get('/products', (req, res) => {
  const query = "SELECT title, pricing, img, colour, urlpg FROM cottonon WHERE category = 'graphictees'";

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching cotton:', error);
      res.status(500).send('Error fetching cottonon');
      return;
    }

    // Render product-list.ejs with products data
    res.render('products', { products: results });
  });
});

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

app.post('/upload', upload.array('images', 10), async (req, res) => {
  const maxWidth = 800; // Maximum width of resized image
  const maxHeight = 600; // Maximum height of resized image

  try {
    const uploadPromises = req.files.map(async (file) => {
      const imgPath = file.path;
      const resizedImgBuffer = await resizeImage(imgPath, maxWidth, maxHeight);
      const encodedImg = resizedImgBuffer.toString('base64');

      // Store image in MySQL
      const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
      return new Promise((resolve, reject) => {
        db.query(sql, [folderId, encodedImg], (err, result) => {
          if (err) reject(err);
          resolve(`data:image/jpeg;base64,${encodedImg}`);
        });
      }).finally(() => {
        // Asynchronously delete the uploaded file
        fs.unlink(imgPath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${imgPath}`, err);
          }
        });
      });
    });

    const results = await Promise.all(uploadPromises);
    res.json({ folderId, images: results });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing images');
  }
});

// Route to add image from URL
app.post('/add-url-image', async (req, res) => {
  const { url } = req.body;
  
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(url); // Note the use of .default
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const encodedImg = buffer.toString('base64');

    // Store image in MySQL
    const sql = 'INSERT INTO images (folder_id, img) VALUES (?, ?)';
    db.query(sql, [folderId, encodedImg], (err, result) => {
      if (err) throw err;
      res.json({ folderId, imageUrl: `data:image/jpeg;base64,${encodedImg}` });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching image from URL');
  }
});

// Route to delete folder
app.delete('/delete-folder/:folderId', (req, res) => {
const { folderId } = req.params;
const sql = 'DELETE FROM images WHERE folder_id = ?';
db.query(sql, [folderId], (err, result) => {
  if (err) {
    console.error(err);
    return res.status(500).send('Error deleting folder');
  }
  res.send('Folder deleted');
});
});

// Serve the HTML file
app.get('/upload', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'upload.html'));
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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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
  res.redirect('/upload.html');
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