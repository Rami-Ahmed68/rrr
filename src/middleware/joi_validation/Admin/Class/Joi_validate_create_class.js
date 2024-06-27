const Joi = require("joi");

const Validate_class_create = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        admin_id : Joi.string().required(),
        teacher_id : Joi.string().required(),
        title : Joi.string().min(3).max(100).required(),
        subject : Joi.string().required(),
        note : Joi.string().min(3).max(500),
        class_level : Joi.string().required()
    });

    // validate body data 
    const Error = Schema.validate(data);

    // check if the body has any error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_class_create;