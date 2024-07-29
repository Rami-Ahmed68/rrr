const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../../models/Student/student");

// plan model
const Plan = require("../../../models/Plan/plan");

// validate body data method
const Validate_copy_plan = require("../../../middleware/joi_validation/Student/Plan/Joi_validate_copy");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.put("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_copy_plan(req.body);

    // checkif the body data has any error
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
            arabic: "... عذرا خطأ في معلومات الطالب",
          }),
          400
        )
      );
    }

    // find the plan
    const plan = await Plan.findById(req.body.plan_id);

    // check if the plan is eixsts
    if (!plan) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, plan not found ...",
            arabic: "... عذرا لم يتم العثور على الخطة",
          }),
          404
        )
      );
    }

    // check the method type
    if (req.body.method_type == "copy") {
      // check if the student's my_plans array is has not the plan id and add the plan id to the array
      if (!student.my_plans.includes(plan._id)) {
        student.my_plans.push(plan._id);
      }

      // check if the my_plans's students array is has not the student id and add the student id to the array
      if (!plan.students.includes(student._id)) {
        plan.students.push(student._id);
      }
    } else if (req.body.method_type == "remove") {
      // remove plan ID from student's my_plans array (corrected logic)
      const studentPlansIndex = student.my_plans.indexOf(plan._id);
      if (studentPlansIndex !== -1) {
        // Check if plan ID exists in array
        student.my_plans.splice(studentPlansIndex, 1); // Remove the plan ID
      }

      // remove student ID from plan's students array (corrected logic)
      const planStudentsIndex = plan.students.indexOf(student._id);
      if (planStudentsIndex !== -1) {
        // Check if student ID exists in array
        plan.students.splice(planStudentsIndex, 1); // Remove the student ID
      }
    }

    // save the student after changed
    await student.save();

    // save the plan after changed
    await plan.save();

    // create result
    const result = {
      message:
        req.body.method_type == "copy"
          ? "Plan coyed successfully"
          : "Plan removed successfully",
      plan_data: _.pick(plan, [
        "_id",
        "title",
        "description",
        "note",
        "plan_info",
        "students",
        "teachers",
        "class_level",
        "created_at",
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
          english: `${error}`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
