const Joi = require("joi");
const path = require("path");
const fs = require("fs");

const validateEvent = (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      description: Joi.string().min(3).max(50).required(),
      type: Joi.string().min(3).max(50).required(),
      startDate: Joi.date().iso().required(), // ISO 8601 format date with time (required)
      endDate: Joi.date().iso().required()
    });
  
    //startdate must be later than today
    //enddate must be later than startdate
    const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body
  
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const today = new Date();

    if (validation.error) {
      const errors = validation.error.details.map((error) => error.message);
      res.status(400).json({ message: "Validation error", errors });
      // Remove the uploaded file
      fs.unlinkSync(req.file.path);
      return; // Terminate middleware execution on validation error
    }  
    else if (startDate < today) {
      res.status(400).json({ message: "Start date must be later than today." });
      // Remove the uploaded file
      fs.unlinkSync(req.file.path);
      return;
    } 
    else if (endDate < startDate) {
      res.status(400).json({ message: "End date must be later than start date." });
      // Remove the uploaded file
      fs.unlinkSync(req.file.path);
      return;
    }
    //This will replace the json of displaying event.
    // else {
    //     res.status(201).json({
    //         message: "Event successfully created."
    //     })
    // }
  
    if (req.file) {
      // Construct the image path
      const imagePath = path.join("/images/events", `${req.file.originalname}`);
      req.body.imagePath = imagePath; // Save the image path to the request body
      req.file.path = path.join(__dirname, "../public", imagePath);
    } else {
      return res.status(400).json({ message: "Image is required." });
    }

    next(); // If validation passes, proceed to the next route handler
  };
  
module.exports = validateEvent;