const Joi = require("joi");


const updateArticleBodySchema = Joi.object({
    Body: Joi.string().required()
  });
  
  const validateUpdateArticleBody = (req, res, next) => {
    const { error } = updateArticleBodySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
  
module.exports = validateUpdateArticleBody;