const Joi = require("joi");

const Validate_admin_update = (data, next) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    parent_id: Joi.string().required(),
    name: Joi.string().min(3),
    password: Joi.string().min(8).max(100),
    phone_number : Joi.string(),
    delete_avatar: Joi.string(), // true to delete the avatar and set the default avatar
  });

  // validate data
  const Error = Schema.validate(data);

  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_admin_update;
