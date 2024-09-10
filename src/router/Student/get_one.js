const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");

router.get("/", async (req, res, next) => {
  try {
    // create schema
    const Schema = Joi.object().keys({
      student_id: Joi.string().required(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // check if the query data has any error
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
    const student = await Student.findById(req.query.student_id).populate([
      {
        path: "classes",
        select: "_id title cover home_works subject students created_at",
      },
      {
        path: "my_plans",
        select: "_id title description students teachers",
        limit : 5
      },
      {
        path: "created_by",
        select: "_id name avatar",
      },
    ]);

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
      message: "Student geted successfully",
      // { user data } ot save all users data in one profile objectin vue.js's store
      user_data: _.pick(student, [
        "_id",
        "name",
        "avatar",
        "email",
        "about_me",
        "phone_number",
        "gender",
        "finished_exams",
        "points",
        "total_gpa",
        "List_of_modifiers",
        "classes",
        "my_plans",
        "class_level",
        "joind_at",
        "birth_date",
        "created_by",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    // return error
    return next(
      new ApiErrors(
        JSON.stringify({
          english: `${error} ...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
