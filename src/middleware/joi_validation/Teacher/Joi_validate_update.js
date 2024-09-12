const Joi = require("joi");

const Validate_admin_update = (data) => {
  // validate update admin data
  const Schema = Joi.object().keys({
    teacher_id: Joi.string().required(),
    name: Joi.string().min().max(),
    password: Joi.string().min().max(),
    gender: Joi.string(),
    about_me : Joi.string(),
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
