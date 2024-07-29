const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// food model
const Food = require("../../models/Food/food");

router.get("/", async (req, res, next) => {
  try {
    // create schema
    const Schema = Joi.object().keys({
      title: Joi.string(),
      limit: Joi.number(),
      page: Joi.number(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // check if the query data has any error
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

    // create foods
    let foods;

    if (req.query.title) {
      foods = await Food.find({
        title: { $regex: new RegExp(req.query.title, "ig") },
      })
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });
    } else {
      foods = await Food.find().skip(skip).limit(limit).sort({ _id: -1 });
    }

    // create result
    const result = {
      message: "Foods geted successfully",
      foods_data: foods.map((food) =>
        _.pick(food, ["_id", "title", "description", "images", "created_at"])
      ),
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
