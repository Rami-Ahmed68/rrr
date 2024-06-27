const Joi = require("joi");

const Validate_plan_create = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        super_admin_id : Joi.string().required(),
        title : Joi.string().min(5).max(50).required(),
        description : Joi.string().min(5).max(100).required(),
        note : Joi.string().min(3).max(100),
        plan_info : Joi.array().required(),
        class_level : Joi.string().required()
    });

    // validate data using Schem
    const Error = Schema.validate(data);

    // check if the data has any error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_plan_create;