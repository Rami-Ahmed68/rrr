const Joi = require("joi");

const Validate_parent_update = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    parent_id: Joi.string().required(),
    name: Joi.string().min(3).max(100),
    password: Joi.string().min(8).max(100),
    children: Joi.string(),
    gender: Joi.string(),
    delete_avatar: Joi.string(),
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

module.exports = Validate_parent_update;
