const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../config/.env" });

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// class model
const ClassSchema = require("../../models/Class/class");

router.get("/", async (req, res, next) => {
  try {
    // craeet Schema to valiadte query data
    const Schema = Joi.object().keys({
      title: Joi.string(),
      limit: Joi.number(),
      page: Joi.number(),
    }); // validate query data

    const Error = Schema.validate(req.query); // chec if the query data has any error

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
    } // home page

    const limit = req.query.limit ? parseInt(req.query.limit) : 10; // limit of documents

    const page = req.query.page ? parseInt(req.query.page) : 1; // skip of documents

    const skip = (page - 1) * limit; // create classes

    let classesObjects; // check if query data has class level query

    if (req.query.title) {
      // get all classes
      classesObjects = await ClassSchema.find({
        title: { $regex: new RegExp(req.query.title, "ig") },
      })
        .populate([
          {
            path: "teacher",
            select: "_id name avatar",
          },
          {
            path: "created_by",
            select: "_id name avatar",
          },
        ])
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });
    } else {
      // get all classes
      classesObjects = await ClassSchema.find()
        .populate([
          {
            path: "teacher",
            select: "_id name avatar",
          },
          {
            path: "created_by",
            select: "_id name avatar",
          },
        ])
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });
    } // create result

    const result = {
      message: "Classes geted successfully",
      classes_data: classesObjects.map((classObject) =>
        _.pick(classObject, [
          "_id",
          "title",
          "cover",
          "subject",
          "note",
          "students",
          "home_works",
          "teacher",
          "class_level",
          "created_by",
          "created_at",
        ])
      ),
    }; // send the result

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
