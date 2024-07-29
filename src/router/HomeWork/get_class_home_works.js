const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// home work model
const Home_Work = require("../../models/HomeWork/homeWork");

router.get("/", async (req, res, next) => {
  try {
    // create Schema
    const Schema = Joi.object().keys({
      class_id: Joi.string().required(),
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

    // find the home works by class id
    const home_works = await Home_Work.find({ class_id: req.query.class_id })
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    // create result
    const result = {
      message: "Home works getde successfully",
      home_works_data: home_works.map((home_work) =>
        _.pick(home_work, [
          "_id",
          "title",
          "description",
          "note",
          "level",
          "class_id",
          "subject",
          "images",
          "created_by",
          "created_at",
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
          english: `${error}...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
