const Joi = require("joi");

const Validate_update_message = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        super_admin_id : Joi.string().required(),
        message_id : Joi.string().required(),
        title : Joi.string().min(5).max(50),
        description : Joi.string().min(5).max(500),
        note : Joi.string(),
        recipient : Joi.string(),
        level : Joi.string()
    });

    // validate data
    const Error = Schema.validate(data);

    // check if the bod data has any error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_update_message;