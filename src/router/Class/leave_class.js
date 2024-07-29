const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../config/.env" });

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// class model
const ClassSchema = require("../../models/Class/class");

// student modle
const Student = require("../../models/Student/student");

// valiadte body data method
const Validate_class_join_leave = require("../../middleware/joi_validation/Class/Joi_validate_join_leave_class");

// verify token data method
const VerifyToken = require("../../utils/token_methods/VerifyToken");

router.put("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_class_join_leave(req.body);

    // check if the body data has any error
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

    // find the student by id
    const student = await Student.findById(req.body.student_id);

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

    // find the class
    const classObject = await ClassSchema.findById(req.body.class_id).populate([
      {
        path: "created_by",
        select: "_id name avatar",
      },
      {
        path: "teacher",
        select: "_id name avatar",
      },
    ]);

    // check if the class is exists
    if (!classObject) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, class not found ...",
            arabic: "... عذرا لم يتم العثور على الصف",
          }),
          404
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the student id in token is equal id in body
    if (VerifyTokenData._id != req.body.student_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, student data ...",
            arabic: "... عذرا خطأ في بيانات الطالب",
          }),
          400
        )
      );
    }

    // check if the student joined to class
    if (
      !classObject.students.includes(student._id) &&
      !student.classes.includes(classObject._id)
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you are not in the class ...",
            arabic: "... عذرا انت لست منضم للصف",
          }),
          403
        )
      );
    }

    // delete the student id from class's students array
    classObject.students = classObject.students.filter(
      (studentId) => studentId != req.body.student_id
    );

    // delete the class id from student's classes array
    student.classes = student.classes.filter(
      (classObId) => classObId != req.body.class_id
    );

    // save the student after changes
    await student.save();

    // save the class after changes
    await classObject.save();

    // create result
    const result = {
      message: "Leaved successfully",
      class_data: _.pick(classObject, [
        "_id",
        "title",
        "cover",
        "teacher",
        "students",
        "subject",
        "note",
        "home_works",
        "class_level",
        "created_by",
        "created_by_type",
      ]),
    };

    // send result
    res.status(200).send(result);
  } catch (error) {
    // return error
    return next(
      new ApiErrors(
        JSON.stringify({
          english: `${error}...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
