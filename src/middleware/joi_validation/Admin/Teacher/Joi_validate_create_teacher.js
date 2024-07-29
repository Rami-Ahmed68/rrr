const Joi = require("joi");

const Validate_teacher_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    editor: Joi.boolean().required(),
    subject: Joi.string().required(),
    email: Joi.string().min(5).max(50).email().required(),
    password: Joi.string().min(8).max(100).required(),
    about_me: Joi.string().min(10).max(500),
    gender: Joi.string().required(),
    class_level: Joi.string().required(),
  });

  // validate body data using Schema
  const Error = Schema.validate(data);

  // return the error to use in router file
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_teacher_create;
