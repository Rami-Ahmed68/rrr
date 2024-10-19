const Joi = require("joi");

const Validate_update_question = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    question_id: Joi.string().required(),
    title: Joi.string().allow(''),
    description: Joi.string().allow(''),
    note: Joi.string().allow(''),
    points: Joi.number(),
    level: Joi.string().allow(''),
    class_level: Joi.string().allow(''),
    repated: Joi.string().allow(''),
    options: Joi.string().allow(''),
    images_for_delete: Joi.string(),
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

module.exports = Validate_update_question;
