const Joi = require("joi");

const Validate_create_question = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    title: Joi.string().min(3).max(300).required(),
    description: Joi.string().min(3).max(300).required(),
    note: Joi.string().min(5).max(100),
    points: Joi.number().required(),
    level: Joi.string().required(),
    class_level: Joi.string().required(),
    repated: Joi.array(),
    options: Joi.array().required(),
  });

  // validate body data
  const Error = Schema.validate(data);

  // check if the body data has any error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_create_question;
