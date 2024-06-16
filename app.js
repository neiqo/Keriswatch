// MODULE IMPORTS
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Import body-parser
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// APPLICATION SETUP
const app = express();
const staticMiddleware = express.static("public/html");
const port = process.env.PORT || 3000; // Use environment variable or default port

// SERVE STATIC FILES

// MIDDLEWARE CONFIGURATION
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware); // Mount the static middleware

// MULTER CONFIG FOR IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // set destination folder for uploaded images
    const tempDir = path.join(__dirname, 'uploads/temp'); // set temp folder
    
    // create the tempdir if it doesnt exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir); // set  the temp dir as the destination of the uploaded images
  },

  // set filename for uploaded images
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // use current timestamp (based on unix) and original file extension(jpg or wtv)
  }
});

// filter to only allow image files
function fileFilter(req, file, cb) {
  // if file is image accept and put in the temp dir
  if (file.mimetype.startsWith('image/')) {
      cb(null, true);
  } else { // dont accept
      cb(new Error('Only image files are allowed!'), false);
  }
}

// init multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// CONTROLLERS
const articlesController = require("./controllers/articlesController"); // ARTICLE CONTROLLER


// CONTROLLER ROUTINGS
// ARTICLE ROUTES
app.get("/search", articlesController.searchArticles); // route for searching articles
app.get("/articles", articlesController.getAllArticles); // basic route for getting all articles in the db
app.post("/addArticle", upload.array('images', 3), articlesController.addArticle); // route for adding articles with max 3 images

// DATABASE CONNECTION
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
