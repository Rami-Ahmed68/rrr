const Joi = require("joi");

const Validate_plan_update = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    plan_id: Joi.string().required(),
    title: Joi.string().min(5).max(50),
    description: Joi.string().min(5),
    note: Joi.string().min(3),
    plan_info: Joi.array(),
    class_level: Joi.string(),
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

module.exports = Validate_plan_update;
