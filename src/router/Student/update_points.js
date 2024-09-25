const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");

// validate body data method
const Validate_student_points = require("../../middleware/joi_validation/Student/Joi_validate_points");

router.put("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_student_points(req.body);

    // check if the body data has any eror
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

    //check if the student is exists
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

    // update the student points
    student.points += req.body.points;

    // update finished exams
    student.finished_exams += 1;

    // update total gpa
    student.total_gpa = student.points / student.finished_exams;

    // check if the student's total GPA is more than the top GPA
    if (student.total_gpa >= 1000) {
      // add the student info to student
      student.List_of_modifiers.push({
        total_gpa: student.total_gpa > 1000 ? 1000 : student.total_gpa,
        points: student.points,
        finished_exams: student.finished_exams,
      });

      // reset points count
      student.points = 0;
      // reset total gpa count
      student.total_gpa = 0;
      // reset finished exams count
      student.finished_exams = 0;
    }

    // save the student
    await student.save();

    // create result
    const result = {
      message: "Student's points updated successfully",
      student_data: _.pick(student, [
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
        "classes",
        "plans",
        "class_level",
        "joind_at",
      ]),
    };

    //send the result
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
