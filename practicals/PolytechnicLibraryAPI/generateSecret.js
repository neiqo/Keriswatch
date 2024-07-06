const crypto = require('crypto');

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex'); // Generates a 256-bit (32-byte) random key in hexadecimal format
};

console.log(generateSecretKey());
