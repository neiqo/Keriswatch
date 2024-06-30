// Importing modules, middlewares and controllers
const express = require('express');
const bodyParser = require('body-parser');
const authUser = require('./middlewares/authUser');
const UserController = require('./controllers/userController');
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
const staticMiddleware = express.static("public"); // Path to the public folder

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(staticMiddleware); // Mount the static middleware

// Routes

// Login routes
app.post('/login', authUser.validateLogin, UserController.login);

// Specific-user routes
app.get('/users/:username', UserController.getUserByUsername);
app.delete('/users/:username', UserController.deleteUser); 

// User creation and update routes
app.post('/signup/normal', authUser.validateNormalUser, UserController.createNormalUser); 
app.post('/signup/organisation', authUser.validateOrganisation, UserController.createOrganisation);
app.put('/update/normal', authUser.validateUpdateNormalUser, UserController.updateNormalUser);
app.put('/update/organisation', authUser.validateUpdateOrganisation, UserController.updateOrganisation); 

// Get all users except admin route
app.get('/users', UserController.getAllUsers); 

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
  