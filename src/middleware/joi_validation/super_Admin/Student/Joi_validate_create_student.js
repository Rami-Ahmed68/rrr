const Joi = require("joi");

const Validate_student_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    name: Joi.string().min(3).required(),
    birth_date: Joi.string()
      .required()
      .pattern(/^\d{4}-\d{1,2}-\d{1,2}$/, "YYYY-MM-DD"), // Date pattern validation
    email: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(8).max(100).required(),
    gender: Joi.string().required(),
    about_me: Joi.string().min(5),
    class_level: Joi.string().required(),
    phone_number: Joi.string().min(10).max(10).allow(''),
  });

  // validate body data using Schema
  const Error = Schema.validate(data);

  // return the error use it in router file
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_student_create;
