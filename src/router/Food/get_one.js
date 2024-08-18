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
    // create a Schema to validate query data
    const Schema = Joi.object().keys({
      food_id: Joi.string().required(),
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

    // find the food
    const food = await Food.findById(req.query.food_id).populate({
      path: "created_by",
      select: "_id name avatar",
    });

    // check if the food is exists
    if (!food) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, food meal not found ...",
            arabic: "... عذرا لم يتم العثور على وجبة الطعام",
          }),
          404
        )
      );
    }

    // create result
    const result = {
      message: "Food geted successfully",
      food_data: _.pick(food, [
        "_id",
        "title",
        "description",
        "images",
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
