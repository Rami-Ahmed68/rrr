const Joi = require("joi");

const Validate_super_admin_update = (data) => {
  // create schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    name: Joi.string().min(3).max(100),
    password: Joi.string().min(8).max(100),
    gender: Joi.string(),
    delete_avatar: Joi.string(), // true to delete avatar and set the default avatar
  });

  // validate data
  const Error = Schema.validate(data);

  // check if the body data has error return it
  if (Error.error) {
    return Error;
  } else {
    return false;
  }
};

module.exports = Validate_super_admin_update;
