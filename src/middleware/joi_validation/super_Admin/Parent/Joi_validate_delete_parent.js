const Joi = require("joi");

const Validate_parent_delete = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    parent_id: Joi.string().required(),
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

module.exports = Validate_parent_delete;
