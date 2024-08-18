const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error mthod
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");

// teacher model
const Teacher = require("../../models/Teacher/teacher");

// rate model
const Rate = require("../../models/Rate/rate");

// verify token data method
const VerifyToken = require("../../utils/token_methods/VerifyToken");

// validate body data method
const Validate_add_rate = require("../../middleware/joi_validation/Rate/add_rate_validate");

router.put("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_add_rate(req.body);

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

    // find the student
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

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the student id in token is equal id in body
    if (VerifyTokenData._id != req.body.student_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid student data ...",
            arabic: "... عذرا خطأ في بيانات الطالب",
          }),
          400
        )
      );
    }

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check oif the teacher is exists
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

    // check if the teacher rate status is true => ( Modification is allowed )
    if (!teacher.rate_status) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            englsh: "Sorry, teacher ratings are not allowed yet ...",
            arabic: "... عذرا لم يتم السماح بتقييم المدرسون بعد",
          }),
          403
        )
      );
    }

    // check if the student's class_level is equal teacher's class_level
    if (teacher.class_level == student.class_level) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you cannot evaluate a teacher of a different level than yours",
            arabic: "... عذرا لا يمكنك تقييم مدرس من مستوى مختلف عن مستواك",
          }),
          403
        )
      );
    }

    // check if the student already added rate
    const oldRate = await Rate.find({
      teacher_id: req.body.teacher_id,
      student_id: req.body.student_id,
    });

    // check if the oldRate's length is more than 0
    if (oldRate.length > 0) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you cannot evaluate a teacher more than once ...",
            arabic: "... عذرا لا يمكنك تقييم المدرس اكثر من مرة",
          }),
          403
        )
      );
    }

    // create rate
    const rate = new Rate({
      teacher_id: req.body.teacher_id,
      student_id: req.body.student_id,
      rate: req.body.rate,
    });

    // save the rate
    await rate.save();

    // save the teacher
    await teacher.save();

    // create result
    const result = {
      meesage: "Rate added successfully",
      teacher_data: _.pick(teacher, [
        "_id",
        "name",
        "avatar",
        "subject",
        "about_me",
        "gender",
        "rate",
        "rate_status",
        "list_of_rate",
        "classes",
        "my_plans",
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
