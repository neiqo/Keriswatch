const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; // Output file for the spec
const routes = ["./app.js"]; // Path to your API route files

const doc = {
  info: {
    title: "KerisWatch API",
    description: "Description of the API",
  },
  host: "localhost:3000", // Replace with your actual host if needed
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter 'Bearer' [space] and then your token in the text input below. Example: 'Bearer abcdef12345'",
    },
  },
};

swaggerAutogen(outputFile, routes, doc);