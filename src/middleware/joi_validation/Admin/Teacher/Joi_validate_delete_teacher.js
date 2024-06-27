const Joi = require("joi");

const Validate_teacher_delete = (data) => {
    // create Schema to validate body data uusing it
    const Schema = Joi.object().keys({
        admin_id : Joi.string().required(),
        teacher_id : Joi.string().required()
    });

    // validate body data using Schema
    const Error = Schema.validate(data);

    // return the error to use in router
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_teacher_delete;