const Joi = require("joi");


const Validate_class_join_leave = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        student_id : Joi.string().required(),
        class_id : Joi.string().required(),
    });

    // validate nody data
    const Error = Schema.validate(data);

    // check if the body data has any error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_class_join_leave;