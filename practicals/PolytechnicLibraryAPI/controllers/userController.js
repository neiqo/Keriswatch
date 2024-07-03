const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.js');
require('dotenv').config();

const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await userModel.registerUser(username, hashedPassword, role);

    const token = jwt.sign({ userId: newUser.user_id, role: newUser.role }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
};
