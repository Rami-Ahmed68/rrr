const Joi = require("joi");

const Validate_update_question = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    question_id: Joi.string().required(),
    title: Joi.string().min(3),
    description: Joi.string().min(3),
    note: Joi.string().min(5),
    points: Joi.number(),
    level: Joi.string(),
    class_level: Joi.string(),
    repated: Joi.string(),
    options: Joi.string(),
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
