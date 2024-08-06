const Joi = require("joi");

const Validate_admin_data = (data) => {
  // creaet Schema to validate body data useing it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().required().min(5).max(50).email(),
    password: Joi.string().required().min(8).max(100),
    gender: Joi.string().required(),
    is_admin: Joi.boolean().required(),
    avatar: Joi.string(),
    phone_number: Joi.string().min(10).max(10),
  });

  // validate body data using schema
  const Error = Schema.validate(data);

  // return the error to use in router file
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_admin_data;
