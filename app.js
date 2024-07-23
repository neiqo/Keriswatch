// MODULE IMPORTS
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Import body-parser
const path = require("path");
const fs = require("fs");

// APPLICATION SETUP
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port
// SERVE STATIC FILES
const staticMiddleware = express.static("public/html");


// MIDDLEWARE CONFIGURATION
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware); // Mount the static middleware

const upload = require("./middlewares/multerConfig"); // Import the multer configuration
const authUser = require('./middlewares/authUser');
const validateEvent = require("./middlewares/validateEvent");
const validateUpdateEvent = require("./middlewares/validateUpdateEvent");
const uploadEventImage = require("./middlewares/validateEventImage");

// CONTROLLERS
const articlesController = require("./controllers/articlesController"); // ARTICLE CONTROLLER
const bookmarkController = require("./controllers/bookmarksController"); // BOOKMARK CONTROLLER
const UserController = require('./controllers/userController');
const eventsController = require("./controllers/eventsController");

// CONTROLLER ROUTINGS
// LOGIN ROUTES
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

// EVENT ROUTES
app.get('/events/joined/:userId', (req, res) => { //not done yet
  res.sendFile(path.join(__dirname, 'public/html', 'eventsJoined.html'));
});

// app.get('/events/:id/join', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/html', 'eventJoin.html'));
// });


app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'events.html'));
  // console.log(path.join(__dirname, 'public/html', 'events.html'));
});

// app.get("/events/:id", (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/html', 'eventDetails.html'));
// });

app.get("/events/:id/user/:userId", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'eventDetails.html'));
});

app.get('/events/:id/update', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html', 'eventUpdate.html'));
});



app.get("/api/events", eventsController.getEvents);
app.get("/api/events/all", eventsController.getAllEvents);
app.get("/api/events/category/:categoryId", eventsController.getEventCategory);
app.get("/api/events/location/:locationId", eventsController.getEventLocation);
//app.get("/api/events/search", eventsController.searchEvents);
app.get("/api/events/with-users", eventsController.getEventswithUsers);
// app.post("/api/events/with-users", eventsController.addUsertoEvent);
// app.delete("/api/events/with-users", eventsController.deleteUserfromEvent);
app.get("/api/events/:id/users", eventsController.getNumberofUsersJoined);
app.get("/api/events/:id/user/:userId/joined", eventsController.checkIfUserJoinedEvent);
app.post("/api/events/:id/user/:userId", eventsController.addUsertoEvent);
app.delete("/api/events/:id/user/:userId", eventsController.deleteUserfromEvent);


app.get("/api/events/:id", eventsController.getEventById);
app.get("/api/events/with-users/:eventId", eventsController.getSpecificEventwithUsers);
app.post("/api/events", uploadEventImage.single("image"), validateEvent, eventsController.createEvent, (req, res) => {
  // Handle the form data here
  console.log(req.body);
  res.status(200).send('Event created successfully');
}); // POST for creating books (can handle JSON data)
app.put('/api/events/:id', uploadEventImage.single("image"), (req, res, next) => {
console.log('Passed multer middleware');
next();
}, validateUpdateEvent, (req, res, next) => {
console.log('Passed validateUpdateEvent middleware');
next();
}, eventsController.updateEvent);// app.delete("/api/events/:id", eventsController.deleteEvent);
app.delete("/api/events/:id/with-users", eventsController.deleteEventandUser); 
app.get("/api/events/with-users/:userId", eventsController.getSpecificUserwithEvents); 

//app.delete("/api/events/with-users/:id", eventsController.deleteUserandEvent);


// ARTICLE ROUTES

app.get("/search", articlesController.searchArticles); // route for searching articles
app.get('/articles/:articleID', articlesController.getArticleByID);
app.put("/articles/:articleID/editTags", articlesController.editTags); // route for updating tags
app.delete("/articles/:articleID", articlesController.removeArticle); // route for deleting article
app.get("/articles", articlesController.getAllArticles); // basic route for getting all articles in the db
app.post("/addArticle", upload.array('images', 3), articlesController.addArticle); // route for adding articles with max 3 images
// BOOKMARK ROUTES
app.get("/bookmarks", bookmarkController.getAllBookmarkedArticles); // route for getting all bookmarks by userId
app.post("/bookmarks/:articleId", bookmarkController.addBookmark); // route for adding bookmarked article
app.delete("/bookmarks/:articleId", bookmarkController.deleteBookmark); // route for deleting a bookmarked article


// DATABASE CONNECTION
// Controllers
const statisticsController = require("./controllers/statisticsController");

// GET request routes
app.get("/statistics/:country", statisticsController.getStatisticsByCountry);

// For database connection
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


// APP SHUTDOWN
// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");

  // clear everything in the temp folder
  const tempDir = path.join(__dirname, 'uploads/temp');
  if (fs.existsSync(tempDir)) { // check if temp folder exists data validation mf
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file); // get full path of each file in temp folder
      fs.unlinkSync(filePath); // delete each file at the same time
    });
    console.log("Temp directory cleared");
  }

  process.exit(0); // Exit with code 0 indicating successful shutdown
});
