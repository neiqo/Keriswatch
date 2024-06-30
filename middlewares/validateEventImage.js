const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      //console.log("Setting destination for multer");  
      cb(null, path.join(__dirname, "../public/images/events"));
    },
    filename: function(req, file, cb) {
      //console.log("Setting filename for multer");
      cb(null, file.originalname);
      //cb(null, new Date().toISOString() + file.originalname);

    }
});

// Init upload
const upload = multer({ storage: storage });

module.exports = upload;
