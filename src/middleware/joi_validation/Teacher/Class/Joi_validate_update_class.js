const Joi = require("joi");

const Validate_class_update = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        teacher_id :Joi.string().required(),
        class_id : Joi.string().required(),
        title : Joi.string().min(3).max(100),
        subject : Joi.object(),
        note : Joi.string().min(3).max(500),
        class_level : Joi.object(),
        delete_cover : Joi.boolean().required()
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

module.exports = Validate_class_update;