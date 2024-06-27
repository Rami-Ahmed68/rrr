const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../config/.env" });

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// class model 
const Class = require("../../models/Class/class");

router.get("/" , async(req , res , next) => {
    try {

        // create Schema to validate b=query data 
        const Schema = Joi.object().keys({
            class_id : Joi.string().required()
        });

        // validate query data
        const Error = Schema.validate(req.query);

        // check if the query data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the class
        const classObject = await Class.findById(req.query.class_id).populate([
            {
                path : "teacher",
                select : "_id name avatar"
            },
            {
                path : "students",
                select : "_id name avatar"
            },
            {
                path : "created_by",
                select : "_id name avatar"
            }
        ]);

        // check if the class object is exists 
        if (!classObject) {
            // return error
            return next(new ApiErrors("Invalid class not found ..." , 404));
        }

        // create result
        const result = {
            "message" : "Class geted successfully",
            "class_data" : _.pick(classObject , ["_id" , "title" , "cover" , "teacher" , "students" , "subject" , "note" , "home_works" , "class_level" , "created_by" , "created_by_type"])
        };

        // send the result to user
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}...`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;