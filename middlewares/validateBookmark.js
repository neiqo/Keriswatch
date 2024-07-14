const Joi = require("joi");

const validateBookmark = (req, res, next) => {
    const { userId, articleId } = req.body;
    if (!Number.isInteger(userId) || !Number.isInteger(articleId)) {
      return res.status(400).send("Invalid input: userId and articleId must be integers");
    }
    next();
};

module.exports = validateBookmark;