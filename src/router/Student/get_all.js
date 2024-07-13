const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error model
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");


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

        // check if the query has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // home page
        const page = req.query.page || 1;

        // limit of the documents
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        // create student's
        let students;

        // get all students
        if (req.query.name) {
            students = await Student.find({
                name : { $regex : new RegExp(req.query.name , 'ig') }
            }).skip(skip).limit(limit).sort({ _id : -1 });
        } else {
            students = await Student.find().skip(skip).limit(limit).sort({ _id : -1 });
        }

        // craete result
        const result = {
            "message" : "Student geted successfully",
            "student_data" : students.map(student => _.pick(student , ["_id" , "name" , "avatar" , "email" , "about_me" , "phone_number" , "gender" , "finished_exams" , "points" , "total_gpa" , "List_of_modifiers" , "classes" , "plans" , "class_level" , "created_by" , "joind_at"]))
        }

        // send result
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
