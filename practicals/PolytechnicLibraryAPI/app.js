const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = process.env.APP_PORT; // Use environment variable port

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// Controllers
const userController = require("./controllers/userController");
const bookController = require("./controllers/bookController");

// Middlewares
const validateBook = require("./middlewares/validateBook");
const verifyJWT = require("./middlewares/verifyJWT");

// Routes
//    User Routes
app.post("/register", userController.registerUser);
app.get("/login", userController.userLogin);

//    Book Routes
app.get("/books", verifyJWT, bookController.getAllBooks);
app.get("/books/:bookid", bookController.getBookById);
app.put("/books/:bookid/availability", validateBook, verifyJWT, bookController.updateBook);

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});