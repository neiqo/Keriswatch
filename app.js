// MODULE IMPORTS
const express = require("express");
const fileUpload = require('express-fileupload');
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Import body-parser
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// APPLICATION SETUP
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port
// SERVE STATIC FILES
const staticMiddleware = express.static("public/html");

// MIDDLEWARE CONFIGURATION
// Increase payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For form data handling
app.use(staticMiddleware); // Mount the static middleware

const upload = require("./middlewares/multerConfig"); // Import the multer configuration
const authUser = require('./middlewares/authUser');
const validateEvent = require("./middlewares/validateEvent");
const validateUpdateEvent = require("./middlewares/validateUpdateEvent");
const uploadEventImage = require("./middlewares/validateEventImage");
const verifyJWT = require('./middlewares/verifyJWT');
const storage = multer.memoryStorage();
const profilePictureUpload = multer({ storage: storage });

// CONTROLLERS
const articlesController = require("./controllers/articlesController"); // ARTICLE CONTROLLER
const bookmarkController = require("./controllers/bookmarksController"); // BOOKMARK CONTROLLER
const userController = require('./controllers/userController');
const eventsController = require("./controllers/eventsController");
const CommentController = require('./controllers/commentController');
const statisticsController = require("./controllers/statisticsController");
const tokenController = require('./controllers/tokenController');

// CONTROLLER ROUTINGS
// LOGIN ROUTES
app.get('/login', (req, res) => { 
  res.sendFile(path.join(__dirname + '/public/html/login.html'));
  console.log(path.join(__dirname + '/public/html/login.html'));
});

app.post('/api/login', authUser.validateLogin, userController.userLogin);
app.post('/api/logout', verifyJWT, userController.userLogout);
app.delete('/api/token', tokenController.deleteToken);

// Specific-user routes
app.get('/api/users/:username', userController.getUserByUsername);
app.delete('/api/users/:username', verifyJWT, userController.deleteUser); 

// User creation and update routes
app.post('/api/signup/normal', authUser.validateNormalUser, userController.registerUser);
// profilePictureUpload.single('profilePicture')
app.post('/api/signup/organisation', authUser.validateOrganisation, userController.registerUser);

app.put('/api/update/normal', verifyJWT, authUser.validateUpdateNormalUser, userController.updateNormalUser);
app.put('/api/update/organisation', verifyJWT, authUser.validateUpdateOrganisation, userController.updateOrganisation); 

// Get all users except admin route
app.get('/api/users', userController.getAllUsers); 

// Get specific user profile picture
app.get('/api/users/:username/profilePicture', userController.getProfilePicture);

// COMMENT ROUTES
app.get('/api/:articleId/comments', CommentController.getArticleComments);
app.post('/api/comments', verifyJWT, CommentController.createComment);
app.delete('/api/comments/:commentId', verifyJWT, CommentController.deleteComment);
app.post('/api/comments/:commentId/upvote', verifyJWT, CommentController.upvoteComment);
app.post('/api/comments/:commentId/downvote', verifyJWT, CommentController.downvoteComment);

// EVENT ROUTES
app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/events.html'));
  console.log(path.join(__dirname + '/public/html/events.html'));
});

app.get("/events/:id", (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/eventDetails.html'));
});

app.get('/events/:id/update', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/eventUpdate.html'));
  console.log(path.join(__dirname + '/public/html/eventUpdate.html'));
});



app.get("/api/events", eventsController.getEvents);
app.get("/api/events/all", eventsController.getAllEvents);
//app.get("/api/events/search", eventsController.searchEvents);
app.get("/api/events/with-users", eventsController.getEventswithUsers);
app.post("/api/events/with-users", eventsController.addUsertoEvent);
app.delete("/api/events/with-users", eventsController.deleteUserfromEvent);


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
//app.delete("/api/events/with-users/:id", eventsController.deleteUserandEvent);


// ARTICLE ROUTES
app.get("/search", articlesController.searchArticles); // route for searching articles
app.get('/articles/:articleID', articlesController.getArticleByID);
app.put("/articles/:articleID/editTags", articlesController.editTags); // route for updating tags
app.put("/articles/:articleID", articlesController.updateArticleBody); // route for editing article
app.delete("/articles/:articleID", articlesController.removeArticle); // route for deleting article
app.get("/articles", articlesController.getAllArticles); // basic route for getting all articles in the db
app.post("/addArticle", upload.array('images', 3), articlesController.addArticle); // route for adding articles with max 3 images

// BOOKMARK ROUTES
app.get("/bookmarks", bookmarkController.getAllBookmarkedArticles); // route for getting all bookmarks by userId
app.post("/bookmarks/:articleId", bookmarkController.addBookmark); // route for adding bookmarked article
app.delete("/bookmarks/:articleId", bookmarkController.deleteBookmark); // route for deleting a bookmarked article

// STATISTICS ROUTES
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
