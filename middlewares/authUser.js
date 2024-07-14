const Joi = require('joi');

// Middleware for validating NormalUser creation
const validateNormalUser = (req, res, next) => {
    console.log(req.body.username);
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(50).required(),
        email: Joi.string().email().required(),
        country: Joi.string().min(2).max(50).required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message);
        res.status(400).json({ message: 'Validation error', errors });
        console.log(req.body.username);
        return;
    }

    next();
};

// Middleware for validating updating NormalUser account details
const validateUpdateNormalUser = (req, res, next) => {
    console.log(req.body.username);
    const schema = Joi.object({
        oldUsername: Joi.string().min(3).max(30).required(),
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(50).required(),
        email: Joi.string().email().required(),
        country: Joi.string().min(2).max(50).required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message);
        res.status(400).json({ message: 'Validation error', errors });
        console.log(req.body.username);
        return;
    }

    next();
};


// Middleware for validating Organisation creation
const validateOrganisation = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(50).required(),
        email: Joi.string().email().required(),
        orgNumber: Joi.number().integer().required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message);
        res.status(400).json({ message: 'Validation error', errors });
        return;
    }

    next();
};

// Middleware for validating updating NormalUser account details
const validateUpdateOrganisation = (req, res, next) => {
    console.log(req.body.username);
    const schema = Joi.object({
        oldUsername: Joi.string().min(3).max(30).required(),
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(50).required(),
        email: Joi.string().email().required(),
        orgNumber: Joi.number().integer().required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message);
        res.status(400).json({ message: 'Validation error', errors });
        console.log(req.body.username);
        return;
    }

    next();
};

// Middleware for validating login
const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(50).required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map(error => error.message);
        res.status(400).json({ message: 'Validation error', errors });
        return;
    }

    next();
};

module.exports = { validateNormalUser, validateOrganisation, validateLogin, validateUpdateNormalUser, validateUpdateOrganisation };
