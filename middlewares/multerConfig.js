const multer = require("multer");
const path = require("path");
const fs = require("fs");

// MULTER CONFIG FOR IMAGE UPLOAD FOR ARTICLES (MAY BE CHANGED FOR PROFILE PICTURE UPLOAD OR PUT INTO ITS OWN THING BECAUSE OF THE UNIX TIMESTAMP FILENAME)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // set destination folder for uploaded images
      const tempDir = path.join(__dirname, '../uploads/temp'); // set temp folder
      
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

module.exports = upload;
