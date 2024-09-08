const express = require('express');
const router = express.Router();
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");

router.get("/" , async (req , res , next) => {
  try {

    // craete shcema to validate body data 
    const Schema = Joi.object().keys({
      student_id : Joi.string().require()
    });

    // validate query data 
    const Error = Schema.validate(req.query);

    // check if the has any error
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
      path : "my_plans",
      select : "_id title description note students teachers created_at"
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
    const result = {
      "messgae" : "Student's plans geted successfully",
      "plans_data" : student.my_plans
    }

    // send results
    res.status(200).send(result);

  } catch (error) {
    // return error
    return next(new ApiErrors(JSON.stringify({
      english : `${error} ...`,
      arabic : "... عذرا خطأ عام"
    }) , 500));
  }
});

module.exports = router;