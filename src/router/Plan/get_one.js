const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// plan model
const Plan = require("../../models/Plan/plan");

router.get("/", async (req, res, next) => {
  try {
    // Schema to validate query data
    const Schema = Joi.object().keys({
      plan_id: Joi.string().required(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // chdck if the query data has any error
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

    // find the plan
    const plan = await Plan.findById(req.query.plan_id).populate({
      path: "created_by",
      select: "_id name avatar",
    });

    // check if the plan is exists
    if (!plan) {
      //return error
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

    // create result
    const result = {
      message: "Plan geted successfully",
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
          english: `${error} ...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
