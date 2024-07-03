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

const userLogin = async (req,res) => {
  const {username, password} = req.body;

  try {
    // check if user is in the database based on unique username
    const user = await User.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({message: "User not found!"});
    }

    // check if password used to login matches the password in the database
    //  - the login password is hashed using bcrypt's algorithm and checks if the
    //    login password that is hashed matches exactly to the hashed password in the database
    const isMatchedPass = await bcrypt.compare(password, user.passwordHash);
    if (!isMatchedPass){
      return res.status(401).json({message: "Wrong password!"});
    }

    // generate JWT(JSON Web Token) token
    // user information that is pulled from the database
    const payload = {
      id: user.id,
      role: user.role,
    };
    
    // JWT token that expires after 1 hour that signed by the secret key
    // server will verify the signature/token using the secret key
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "3600s"});

    return res.status(200).json({ token }); // returns the JWT token
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" }) 
  }
}

module.exports = {
  registerUser,
  userLogin
};