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
      title: Joi.string(),
      limit: Joi.number(),
      page: Joi.number(),
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

    // home page
    const page = req.query.page || 1;

    // limit of documents
    const limit = req.query.limit || 5;

    // skip of documents
    const skip = (page - 1) * limit;

    let plans;

    if (req.query.title) {
      // get the plans by class level
      plans = await Plan.find({
        title: { $regex: new RegExp(req.query.title, "ig") },
      })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "created_by",
          select: "_id name avatar",
        })
        .sort({ _id: -1 });
    } else {
      // get all plans
      plans = await Plan.find()
        .skip(skip)
        .limit(limit)
        .populate({
          path: "created_by",
          select: "_id name avatar",
        })
        .sort({ _id: -1 });
    }

    // create result
    const result = {
      message: "Plan geted successfully",
      plans_data: plans.map((plan) =>
        _.pick(plan, [
          "_id",
          "title",
          "description",
          "note",
          "students",
          "teachers",
          "class_level",
          "plan_info",
          "created_at",
          "created_by",
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
