const express = require('express');
const path = require('path'); 
const app = express();
const port = 3000;

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Replace these with your own Google Client ID and Secret
const GOOGLE_CLIENT_ID = '871964147620-3eoiitmpqou6hec1hptos4vgeoeugp4s.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      // Here, you would typically store user information in your database
      return done(null, profile);
  }
));

// Serialize user to the session
passport.serializeUser(function(user, done) {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Define routes
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to home.
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Hello, ${req.user.displayName}</h1><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});