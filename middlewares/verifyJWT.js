require('dotenv').config();
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library for handling JWTs

const secretKey = process.env.JWT_SECRET; // Retrieve the secret key for signing/verifying tokens from environment variables

const verifyJWT = (req, res, next) => {
    // Extract the token from the Authorization header if it exists
    const tokenString = req.headers.authorization && req.headers.authorization.split(' ')[1];

    console.log("Token string: " + tokenString);

    // Parse the JSON object to extract the token
    let token = tokenString;

    try {
      // Attempt to parse the token as JSON
      const tokenObject = JSON.parse(tokenString);
      token = tokenObject.token;
    } catch (error) {
        // If parsing fails, assume the token is a plain string
        token = tokenString;
    }

    console.log("Token in verifyJWT: " + token);
  // If no token is provided, return an Unauthorised error response
  if (!token) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  const decodedHeader = jwt.decode(token, { complete: true });
  console.log("Decoded header:", decodedHeader);

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, decoded) => {
    // If there's an error (e.g., token is invalid or expired), return a Forbidden error response
    if (err) {
      console.log("Token verification error:", err);
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("Decoded in verifyJWT: " + decoded);

    // Define the roles authorised to access specific endpoints
    const authorisedRoles = {
      "/api/update/normal": ["NormalUser"],
      "/api/update/organisation": ["Organisation"],
      "/api/users/[0-9]+": ["Admin"],
      "/api/users" : ["NormalUser", "Organisation", "Admin"],
      "/api/comments": ["NormalUser", "Organisation", "Admin"],
      "/api/comments/[0-9]+": ["NormalUser", "Organisation", "Admin"],
      "/api/comments/[0-9]+/upvote": ["NormalUser", "Organisation", "Admin"],
      "/api/comments/[0-9]+/downvote": ["NormalUser", "Organisation", "Admin"],
      "/api/logout": ["NormalUser", "Organisation", "Admin"],
    };

    // Get the requested endpoint and the user's role from the decoded token
    const requestedEndpoint = req.url;
    const userRole = decoded.role;

    // Check if the user's role is authorised to access the requested endpoint
    const authorisedRole = Object.entries(authorisedRoles).find(
      ([endpoint, roles]) => {
        // Convert the endpoint to a regex pattern
        // $ is used to assert the end of the URL (string)
        const regex = new RegExp(`${endpoint}$`); 
        // Check if the pattern matches the requested endpoint and the role is authorised
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    // If no authorised role is found, return a Forbidden error response
    if (!authorisedRole) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // If authorised, attach the decoded token to the request object for use in subsequent middleware or route handlers
    req.decodedUser = decoded;
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = verifyJWT; // Export the middleware function for use in other parts of the application
