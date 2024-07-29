const Joi = require("joi");

const Validate_hw_delete = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    home_work_id: Joi.string().required(),
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

module.exports = Validate_hw_delete;
