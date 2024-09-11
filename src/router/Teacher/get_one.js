const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../models/Teacher/teacher");

router.get("/", async (req, res, next) => {
  try {
    // create Scehma to validate query data
    const Schema = Joi.object().keys({
      teacher_id: Joi.string().required(),
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

    // get the teacher
    const teacher = await Teacher.findById(req.query.teacher_id).populate([
      {
        path: "classes",
        select: "_id title cover home_works subject students created_at",
        limit : 5
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

    // create result
    const result = {
      message: "Teacher geted succsffully",
      // { user data } ot save all users data in one profile objectin vue.js's store
      user_data: _.pick(teacher, [
        "_id",
        "name",
        "avatar",
        "editor",
        "email",
        "subject",
        "about_me",
        "gender",
        ,
        "rate",
        "list_of_rate",
        "rate_status",
        "classes",
        "my_plans",
        "created_by",
        "class_level"
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
