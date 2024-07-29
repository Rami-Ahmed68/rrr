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
const Validate_plan_create = require("../../../middleware/joi_validation/super_Admin/Plan/Joi_validate_create_plan");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

router.post("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_plan_create(req.body);

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

    // check if the super admin is super admin
    if (!isSuperAdmin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to create plan ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء الخطة",
          }),
          403
        )
      );
    }

    // create the plan
    const plan = new Plan({
      title: req.body.title,
      description: req.body.description,
      note: req.body.note ? req.body.note : "",
      plan_info: req.body.plan_info,
      students: [],
      teachers: [],
      created_by: req.body.super_admin_id,
      class_level: req.body.class_level,
    });

    // save the plan in data base
    await plan.save();

    // create result
    const result = {
      message: "Plan created successfully",
      plan_data: _.pick(plan, [
        "_id",
        "title",
        "description",
        "note",
        "plan_info",
        "students",
        "teachers",
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
          english: error,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
