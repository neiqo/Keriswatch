require('dotenv').config();
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library for handling JWTs

const secretKey = process.env.JWT_SECRET; // Retrieve the secret key for signing/verifying tokens from environment variables

const verifyJWT = (req, res, next) => {
  // Extract the token from the Authorization header if it exists
  const token = req.headers.authorization;

  // If no token is provided, return an Unauthorised error response
  if (!token) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, decoded) => {
    // If there's an error (e.g., token is invalid or expired), return a Forbidden error response
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Define the roles authorised to access specific endpoints
    const authorisedRoles = {
      "/books": ["member", "librarian"],
      "/books/[0-9]+/availability": ["librarian"],
    };

    // Get the requested endpoint and the user's role from the decoded token
    const requestedEndpoint = req.url;
    const userRole = decoded.role;

    // Check if the user's role is authorised to access the requested endpoint
    const authorisedRole = Object.entries(authorisedRoles).find(
      ([endpoint, roles]) => {
        // Convert the endpoint to a regex pattern
        // $ is used to assert the end of the URL (string)
        const regex = new RegExp(`^${endpoint}$`); 
        // Check if the pattern matches the requested endpoint and the role is authorised
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    // If no authorised role is found, return a Forbidden error response
    if (!authorisedRole) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // If authorised, attach the decoded token to the request object for use in subsequent middleware or route handlers
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = verifyJWT; // Export the middleware function for use in other parts of the application
