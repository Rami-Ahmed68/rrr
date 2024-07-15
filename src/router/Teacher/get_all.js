const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../models/Teacher/teacher");

router.get("/" , async (req , res , next) => {
    try {
        
        // create schema
        const Schema = Joi.object().keys({
            name : Joi.string(),
            limit : Joi.number(),
            page : Joi.number()
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

        // home page
        const page = req.query.page || 1;

        // limit of documents
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        // create teachers
        let teachers;

        if (req.query.name) {
            // get teachers
            teachers = await Teacher.find({
                name : { $regex : new RegExp(req.query.name , 'ig') }
            }).skip(skip).limit(limit).sort({ _id : -1 });
        } else {
            // get teachers
            teachers = await Teacher.find().skip(skip).limit(limit).sort({ _id : -1 });
        }

        // create result
        const result = {
            "message" : "Teacher geted successfully",
            "teachers_data" : teachers.map(teacher => _.pick(teacher , ["_id" , "name" , "avatar" , "editor" , "email" , , "rate" , "list_of_rate" , "rate_status" , "subject" , "about_me" , "gender" , "classes" , "my_plans" , "created_by" , "joind_at" , "phone_number" , "class_level"]))
        };

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;
