const Joi = require("joi");

const Validate_delete_food = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    food_id: Joi.string().required(),
  });

  // validate body data
  const Error = Schema.validate(data);

  // check if the body data has any error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_delete_food;
