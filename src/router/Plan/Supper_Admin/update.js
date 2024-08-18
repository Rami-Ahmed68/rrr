const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// plan model
const Plan = require("../../../models/Plan/plan");

// validate body data method
const Validate_plan_update = require("../../../middleware/joi_validation/super_Admin/Plan/Joi_validate_update_plan");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.put("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_plan_update(req.body);

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

    // check if the request has a new data
    if (
      !req.body.title &&
      !req.body.description &&
      !req.body.note &&
      !req.body.plan_info &&
      !req.body.class_level
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموح بالتعديل دون ارسال بيانات جديدة",
          }),
          404
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, super admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب السوبر ادمن",
          }),
          404
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid super admin data ...",
            arabic: "... عذرا خطأ في بيانات السوبر ادمن",
          }),
          400
        )
      );
    }

    // check if the super admin is super admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    if (!isSuperAdmin) {
      // retuen error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to update plan ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل الخطة",
          }),
          403
        )
      );
    }

    // find the plan
    const plan = await Plan.findById(req.body.plan_id);

    // chec if the plan is eixsts
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

    // fidn and update the plan
    const updatePlan = await Plan.findByIdAndUpdate(
      { _id: req.body.plan_id },
      {
        $set: {
          title: req.body.title ? req.body.title : plan.title,
          description: req.body.description
            ? req.body.description
            : plan.description,
          note: req.body.note ? req.body.note : plan.note,
          plan_info: req.body.plan_info ? req.body.plan_info : plan.plan_info,
          teachers: plan.teachers,
          students: plan.students,
          class_level: req.body.class_level
            ? req.body.class_level
            : plan.class_level,
        },
      },
      { new: true }
    );

    // save the plan after changed
    await updatePlan.save();

    // create result
    const result = {
      message: "Plan updated successfully",
      plan_data: _.pick(updatePlan, [
        "_id",
        "title",
        "description",
        "note",
        "plan_info",
        "teachers",
        "students",
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
