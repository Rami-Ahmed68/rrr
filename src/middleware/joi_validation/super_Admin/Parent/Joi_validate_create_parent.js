const Joi = require("joi");

const Validate_parent_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().min(5).max(100).email(),
    password: Joi.string().min(8).max(100).required(),
    gender: Joi.string().required(),
    children: Joi.string(),
    phone_number: Joi.string().min(10).max(10),
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

module.exports = Validate_parent_create;
