const Joi = require("joi");

const Validate_student_update = (data) => {
  // create Schema to validate body data
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    student_id: Joi.string().required(),
    name: Joi.string().min(3),
    birth_date: Joi.string().pattern(/^\d{4}-\d{1,2}-\d{1,2}$/, "YYYY-MM-DD"), // Date pattern validation
    password: Joi.string().min(8).max(100),
    gender: Joi.string(),
    about_me: Joi.string().min(5),
    class_level: Joi.string(),
    delete_avatar: Joi.string(),
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

module.exports = Validate_student_update;
