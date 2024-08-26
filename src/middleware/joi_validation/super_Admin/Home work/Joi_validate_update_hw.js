const Joi = require("joi");

const Validate_hw_create = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    home_work_id: Joi.string().required(),
    title: Joi.string().min(3).max(100).allow(''),
    description: Joi.string().min(3).max(500).allow(''),
    note: Joi.string().min(5).max(100).allow(''),
    level: Joi.string().allow(''),
    images_for_delete: Joi.string(),
    images: Joi.array(),
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
