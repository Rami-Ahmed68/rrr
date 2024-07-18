const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../models/Admin/admin");

router.get("/" , async (req , res , next) => {
    try {

        // create Schema to validate query data
        const Schema = Joi.object().keys({
            admin_id : Joi.string().required()
        });

        // valiadte query data useing Schema
        const Error = Schema.validate(req.query);

        // check if the query data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the admin
        const admin = await Admin.findById(req.query.admin_id);

        // check if the admin is exists
        if (!admin) {
            // return error
            return next(new ApiErrors(JOSN.string({
                english : "Invalid admin not found ...",
                arabic : "... عذرا لم يتم العثور على الأدمن"
            }) , 404));
        }

        // creaet result
        const result = {
            "message" : "Admin geted successfully",
            // { user data } ot save all users data in one profile objectin vue.js's store
            "user_data" : _.pick(admin , ["_id" , "name" , "avatar" , "is_supper_admin" , "is_admin" , "email" , "gender" , "rate" , "phone_number" , "joind_at"])
        };

        // send the result 
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.string({
            english : error,
            arabic : "... خطأ عام"
        }) , 500));
    }
});

module.exports = router;
