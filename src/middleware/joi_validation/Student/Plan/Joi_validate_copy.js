const Joi = require("joi");

const Validate_copy_plan = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        student_id : Joi.string().required(),
        plan_id : Joi.string().required(),
        method_type : Joi.string().required()
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

module.exports = Validate_copy_plan;