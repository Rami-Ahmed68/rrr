const Joi = require("joi");

const Validate_student_delete = (data) => {
  // create Schema to validate body data using it
  const Schema = Joi.object().keys({
    admin_id: Joi.string().required(),
    student_id: Joi.string().required(),
  });

  //validate data using Schema
  const Error = Schema.validate(data);

  // check if the data has any error return it
  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_student_delete;
