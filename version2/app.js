const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Express session
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config for Google OAuth
passport.use(new GoogleStrategy({
    clientID: '871964147620-3eoiitmpqou6hec1hptos4vgeoeugp4s.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
(token, tokenSecret, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Routes
const authRoutes = require('./server/routes/authRoutes');
const productRoutes = require('./server/routes/productRoutes');
const imageRoutes = require('./server/routes/imageRoutes');

app.use(authRoutes);
app.use(productRoutes);
app.use(imageRoutes);

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login.html' }), (req, res) => {
    res.redirect('/deposit.html');
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login.html');
});
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
