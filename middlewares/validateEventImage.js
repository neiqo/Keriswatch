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

//for validate image type
// // File filter for validating image types
// const fileFilter = (req, file, cb) => {
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if(mimetype && extname){
//       return cb(null, true);
//   } else {
//       cb('Error: Images Only!');
//   }
// };

// // Init upload with fileFilter
// const upload = multer({ 
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 5 } // for example, limit file size to 5MB
// });

module.exports = upload;
