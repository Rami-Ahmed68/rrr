const Joi = require("joi");

const Validate_super_admin_login = (data) => {
    // create Schema to validate body data
    const Schema = Joi.object().keys({
        super_admin_email : Joi.string().required().min(5).max(50).email(),
        super_admin_password : Joi.string().required().min(8).max(100)
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

module.exports = Validate_super_admin_login;