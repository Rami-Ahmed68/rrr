const Joi = require("joi");

const Validate_admin_update = (data, next) => {
  // validate update admin data
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    name: Joi.string().min(3).max(100),
    password: Joi.string().min(8).max(100),
    gender: Joi.string(),
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
