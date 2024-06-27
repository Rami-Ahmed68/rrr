const Joi = require("joi");

const Validate_delete_admin = (data) => {
    // creaet Schema to validate body data useing it
    const Schema = Joi.object().keys({
        super_admin_id : Joi.string().required(),
        admin_id : Joi.string().required()
    });

    // validate body data
    const Error = Schema.validate(data);

    // return the error to use in router file
    if (Error.error) {
        return Error
    } else {
        return true
    }
};

module.exports = Validate_delete_admin;