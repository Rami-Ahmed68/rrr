const Joi = require("joi");

const Validate_add_rate = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    student_id: Joi.string().required(),
    teacher_id: Joi.string().required(),
    rate: Joi.number().min(0).max(5).required(),
  });

  // validate data
  const Error = Schema.validate(data);

  // return the error
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_add_rate;
