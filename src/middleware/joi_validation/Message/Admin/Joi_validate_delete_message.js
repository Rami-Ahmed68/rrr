const Joi = require("joi");

const Validate_delete_message = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    message_id: Joi.string().required(),
  });

  // validate data
  const Error = Schema.validate(data);

  // check if the bod data has any error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_delete_message;
