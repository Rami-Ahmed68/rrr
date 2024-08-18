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
const Validate_plan_create = require("../../../middleware/joi_validation/Admin/Plan/Joi_validate_create_plan");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check admin method
const CheckAdmin = require("../../../middleware/CheckAdmin");

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

    // find the admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الادمن",
          }),
          404
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الادمن",
          }),
          400
        )
      );
    }

    // check if the admin is admin
    const isAdmin = CheckAdmin(admin);

    // check if the admin is admin
    if (!isAdmin) {
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
      created_by: req.body.admin_id,
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
        "class_level",
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
