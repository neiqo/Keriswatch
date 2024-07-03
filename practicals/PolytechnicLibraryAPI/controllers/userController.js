const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
require('dotenv').config(); // Load environment variables from a .env file

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Validation code for user registration
    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Validate username uniqueness
    const existingUser = await User.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Validate password strength (example: at least 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password should be at least 8 characters long' });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Register the new user in the database
    const newUser = await User.registerUser(username, hashedPassword, role);

    res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
};