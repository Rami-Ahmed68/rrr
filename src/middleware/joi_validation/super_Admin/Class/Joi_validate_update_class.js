const Joi = require("joi");

const Validate_class_update = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    super_admin_id: Joi.string().required(),
    class_id: Joi.string().required(),
    teacher_id: Joi.string(),
    title: Joi.string().min(3),
    subject: Joi.string(),
    note: Joi.string().min(3),
    class_level: Joi.string(),
    delete_cover: Joi.string(),
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

module.exports = Validate_class_update;
