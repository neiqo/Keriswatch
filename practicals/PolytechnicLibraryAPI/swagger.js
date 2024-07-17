const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; // Output file for the spec
const routes = ["./app.js"]; // Path to your API route files

const doc = {
  info: {
    title: "Polytechnic Library API",
    description: "The objective is to create a secure backend API for the Polytechnic Library system. \
    To achieve this, you'll implement user registration and login, ensuring password hashing using bcryptjs. \
    Additionally, you'll generate JWT tokens for authorized access. For authorization, define user roles (member, librarian) \
    and create middleware to check JWT tokens and roles. Finally, secure API endpoints based on user permissions.",
  },
  host: "localhost:3000", // Replace with your actual host if needed
};

swaggerAutogen(outputFile, routes, doc);
