const Joi = require("joi");

const Validate_student_points = (data) => {
    // create Schema 
    const Schema = Joi.object().keys({
        student_id : Joi.string().required(),
        points : Joi.number().required()
    });

    // validate body data
    const Error = Schema.validate(data);

    // check if the body data has any error
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_student_points;