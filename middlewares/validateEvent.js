const Joi = require("joi");

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
  
    if (validation.error) {
      const errors = validation.error.details.map((error) => error.message);
      res.status(400).json({ message: "Validation error", errors });
      return; // Terminate middleware execution on validation error
    } 
    else if (startDate < new Date().toISOString().split('T')[0]) {
        res.status(400).json({ message: "Start date must be later than today." });
        return;
    }
    else if (endDate < startDate) {
        res.status(400).json({ message: "End date must be later than start date." });
        return;
  
    }
    next(); // If validation passes, proceed to the next route handler
  };
  
module.exports = validateEvent;