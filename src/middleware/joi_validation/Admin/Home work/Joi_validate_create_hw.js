const Joi = require("joi");

const Validate_hw_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    note: Joi.string(),
    class_id: Joi.string().required(),
    level: Joi.string().required(),
  });

  // validate body data
  const Error = Schema.validate(data);

  // check if the body has any error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_hw_create;
