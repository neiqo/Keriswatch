const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // Import the path module
require('dotenv').config(); // Load environment variables from a .env file
const Token = require('../models/token');

const deleteToken = async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        const userId = decoded.userId;
        await Token.deleteToken(userId);
        res.status(200).send('Token deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting token: ' + error.message);
    }
}

module.exports = {
    deleteToken
};