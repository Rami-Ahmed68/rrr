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
    // create Schema
    const Schema = Joi.object().keys({
      class_level: Joi.string().required(),
      page: Joi.number(),
      limit: Joi.number(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // check if the query data has any error
    if (Error.error) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: Error.error.detailes[0].message,
            arabic: "... عذرا خطأ في البيانات المرسلة",
          }),
          400
        )
      );
    }

    // home page
    const page = req.query.page || 1;

    // limit of documents
    const limit = req.query.limit || 5;

    // skip of document
    const skip = (page - 1) * limit;

    // find the students
    const students = await Student.find({
      $or: [
        { List_of_modifiers: { $exists: true } },
        { total_gpa: { $gt: 0 } },
      ],
    })
      .sort({ total_gpa: -1 })
      .skip(skip)
      .limit(limit);

    // create result
    const result = {
      message: "Students geted successfully",
      students_data: students.map((student) =>
        _.pick(student, [
          "_id",
          "name",
          "avatar",
          "points",
          "total_gpa",
          "finished_exams",
          "List_of_modifiers",
          "class_level",
        ])
      ),
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
