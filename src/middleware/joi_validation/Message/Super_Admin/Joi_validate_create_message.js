const Joi = require("joi");

const Validate_create_message = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        super_admin_id : Joi.string().required(),
        title : Joi.string().min(5).max(50).required(),
        description : Joi.string().min(5).max(500).required(),
        note : Joi.string(),
        recipient : Joi.string().required(),
        level : Joi.string().required()
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

module.exports = Validate_create_message;
