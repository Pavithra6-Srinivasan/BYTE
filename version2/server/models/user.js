//const db = require('../config/db');

// Define User model if needed, otherwise just export the db

const Sequelize = require('sequelize'); // Assuming you have Sequelize installed

const sequelize = new Sequelize('byteusers', 'sqluser', 'password', {
  host: 'localhost',
  dialect: 'mysql' // e.g., 'mysql', 'postgres'
});

const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: true // Optional, allow null values
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true // Optional, allow null values
  },
  google_id: {
    type: Sequelize.STRING,
    allowNull: false, // Required field
    unique: true // Ensure unique Google IDs
  }
}, {
  // Additional options for the model (e.g., timestamps)
});

module.exports = User;

// module.exports = db;
