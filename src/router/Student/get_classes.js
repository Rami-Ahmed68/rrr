const express = require("express");
const router = express.Router();
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");

// classes schema
const ClassesSchema = require("../../models/Class/class");

router.get("/" , async (req , res , next) => {
  try {

    // craete Schema to validate query data 
    const Schema = Joi.object().keys({
      student_id : Joi.string().required()
    });

    // validate query data
    const Error = Schema.validate(req.query);
    
    // check if the query has any error
    if (Error.error) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: Error.error.details[0].message,
            arabic: "... عذرا خطأ في البيانات المرسلة",
          }),
          400
        )
      );
    }

    // find the student
    const student = await Student.findById(req.query.student_id).populate({
      path : "classes",
      select : "_id title cover description subject class_level students home_works created_at",
      populate: {
        path: "teacher",
        select: "_id name avatar"
      }
    });

    // check if the student is exists
    if (!student) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, student not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الطالب",
          }),
          404
        )
      );
    }

    // create result
    const results = {
      "messgae" : "Student's classes getd successfully",
      "classes_data" : student.classes
    };

    // send the results
    res.status(200).send(results);

  } catch (error) {
    // return error
    return next(new ApiErrors(JSON.stringify({
      english : `${error} ...`,
      arabic : "... عذرا خطأ عام"
    }) , 500))
  }
});

module.exports = router;