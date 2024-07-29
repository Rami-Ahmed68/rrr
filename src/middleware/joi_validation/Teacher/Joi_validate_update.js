const Joi = require("joi");

const Validate_admin_update = (data) => {
  // validate update admin data
  const Schema = Joi.object().keys({
    teacher_id: Joi.string().required(),
    name: Joi.string().min(3).max(100),
    password: Joi.string().min(8).max(100),
    about_me : Joi.string().min(5).max(500),
    gender: Joi.string(),
    phone_number : Joi.string().min(10).max(10),
    delete_avatar: Joi.string(), // true to delete the avatar and set the default avatar
  });

  // validate data
  const Error = Schema.validate(data);

  if (Error.error) {
    return Error;
  } else {
    return true;
  }
};

module.exports = Validate_admin_update;
