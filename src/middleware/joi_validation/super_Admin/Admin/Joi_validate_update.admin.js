const Joi = require("joi");

const Validate_update_admin = (data) => {
  // create Schema to validate data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    admin_id: Joi.string().required(),
    name: Joi.string().min(3).max(100),
    password: Joi.string().min(8).max(100),
    gender: Joi.string(),
    delete_avatar: Joi.string(),
    phone_number: Joi.string().min(10).max(10),
    is_admin : Joi.boolean()
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

module.exports = Validate_update_admin;
