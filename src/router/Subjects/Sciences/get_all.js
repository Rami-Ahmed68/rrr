const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// sciences model
const Sciences = require("../../../models/Subjects_Banks/Sciences/sciences");

router.get("/", async (req, res, next) => {
  try {
    // create schema
    const Schema = Joi.object().keys({
      class_level: Joi.string(),
      limit: Joi.number(),
      page: Joi.number(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // check if the query data has any erorr
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

    let questions;

    if (req.query.class_level) {
      // get the questions by class level
      questions = await Sciences.find({ class_level: req.query.class_level })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "created_by",
          select: "_id name avatra",
        })
        .sort({ _id: -1 });
    } else {
      // get all the questions
      questions = await Sciences.find()
        .skip(skip)
        .limit(limit)
        .populate({
          path: "created_by",
          select: "_id name avatra",
        })
        .sort({ _id: -1 });
    }

    // create result
    const result = {
      message: "Questions geted successfully",
      questions_data: questions.map((question) =>
        _.pick(question, [
          "_id",
          "title",
          "description",
          "note",
          "points",
          "level",
          "images",
          "repated",
          "options",
          "true_option",
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
