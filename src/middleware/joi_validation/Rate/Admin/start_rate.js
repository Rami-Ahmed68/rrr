const Joi = require("joi");

const Validate_start_rate = (data) => {
    // create Schema to validate body data using it
    const Schema = Joi.object().keys({
        admin_id : Joi.string().required(),
        rate_status : Joi.boolean().required()
    });

    // validate data
    const Error = Schema.validate(data);

    // return the error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_start_rate;