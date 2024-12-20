const Joi = require("joi");

const Validate_plan_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    title: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    note: Joi.string(),
    plan_info: Joi.array().required(),
    class_level: Joi.string().required(),
  });

  // validate data using Schem
  const Error = Schema.validate(data);

  // check if the data has any error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_plan_create;
