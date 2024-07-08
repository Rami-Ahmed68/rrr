const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../../config/.env" });

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// parent model
const Parent = require("../../../models/Parent/parent");

// comapre password's
const compare = require("../../../utils/password_methods/Compaer_Password");

// generate token
const GenerateToken = require("../../../utils/token_methods/GenerateToken");

// validate log in body data method
const Validate_parent_login = require("../../../middleware/joi_validation/Parent/Joi_validate_login");

router.post("/" , async(req , res , next) => {
    try {

        // validate body data 
        const Error = Validate_parent_login(req.body);

        // check if the body data has any error
        if (Error.error) {
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the parent 
        const parent = await Parent.findOne({ email : req.body.email });

        // check if the parent is exists
        if (!parent) {
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid email or password ...",
                arabic : "... عذرا خطأ في الايميل او كلمة المرور"
            }) , 404));
        }

        // compare passwords
        const Compare_password = await compare(req.body.password , parent.password);

        // check if the password 
        if (!Compare_password) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid email or password ...",
                arabic : "... عذرا خطأ في الايميل او كلمة المرور"
            }) , 404));
        }

        // generate token
        const token = GenerateToken(parent._id , parent.email);

        // create result
        const result = {
            "message" : "Loged in successfully",
            "user_data" : _.pick(parent , ["_id" , "name" , "email" , "avatar"]),
            "token" : token
        };

        // send the result to user
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(JSON.stringify({
            english : error,
            arabic : ".. عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;
