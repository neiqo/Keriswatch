const Joi = require("joi");
const path = require("path");
const fs = require("fs");

const validateUpdateEvent = (req, res, next) => {
    console.log('validateUpdateEvent middleware triggered');

    // Log the request body and file
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(3).max(50).required(),
        categoryId: Joi.number().integer().min(1).required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
        locationName: Joi.string().min(1).max(50).required(),
        address: Joi.string().min(1).max(50).required(),
        postalCode: Joi.string().min(1).max(50).required(),
        country: Joi.string().min(1).max(50).required(),
        totalCapacity: Joi.number().integer().min(1).required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const today = new Date();

    if (validation.error) {
        console.log('Validation error:', validation.error.details);
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        if (req.file) {
        fs.unlinkSync(req.file.path);
        }
        return;
    } else if (startDate < today) {
        console.log('Start date validation failed');
        res.status(400).json({ message: "Start date must be later than today." });
        if (req.file) {
        fs.unlinkSync(req.file.path);
        }
        return;
    } else if (endDate < startDate) {
        console.log('End date validation failed');
        res.status(400).json({ message: "End date must be later than start date." });
        if (req.file) {
        fs.unlinkSync(req.file.path);
        }
        return;
    }

    if (req.file) {
        console.log('File is present');
        const imagePath = path.join("/html/images/events", req.file.originalname);
        req.body.imagePath = imagePath;
        req.file.path = path.join(__dirname, "../public", imagePath);
    } else {
        console.log('No file uploaded');
    }
    
    

    


      console.log('Validation passed, proceeding to next middleware');

    next(); // If validation passes, proceed to the next route handler
  };
  
module.exports = validateUpdateEvent;