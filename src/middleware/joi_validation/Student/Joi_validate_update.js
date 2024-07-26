const Joi = require("joi");

const Validate_admin_update = (data) => {
    // validate update admin data
    const Schema = Joi.object().keys({
        student_id : Joi.string().required(),
        name : Joi.string().min(3).max(100),
        password : Joi.string().min(8).max(100),
        gender : Joi.string(),
        phone : Joi.string(),
        about_me : Joi.string().min(5).max(500),
        delete_avatar : Joi.boolean() // true to delete the avatar and set the default avatar
    });

    // validate data
    const Error = Schema.validate(data);

    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_admin_update;
