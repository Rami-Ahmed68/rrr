const express = require("express");
const router = express.Router();
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../models/Teacher/teacher");

router.get("/" , async (req , res , next) => {
  try {

    // craete Schema to validate query data 
    const Schema = Joi.object().keys({
      teacher_id : Joi.string().required()
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

    // find the teacher
    const teacher = await Teacher.findById(req.query.teacher_id).populate({
      path : "classes",
      select : "_id title cover description subject class_level note students home_works created_at",
      populate: {
        path: "teacher",
        select: "_id name avatar"
      }
    });

    // check if the teacher is exists
    if (!teacher) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, teacher not found ...",
            arabic: "... عذرا لم يتم العثور على حساب المدرس",
          }),
          404
        )
      );
    }

    // create result
    const results = {
      "messgae" : "Teacher's classes getd successfully",
      "classes_data" : teacher.classes
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