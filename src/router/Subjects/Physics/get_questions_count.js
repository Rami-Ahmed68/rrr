const express = require("express");
const router = express.Router();
const Joi = require("joi");


// Physics model
const Physics = require("../../../models/Subjects_Banks/Physics/physics");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // create a Schema to validate query data
    const Schema = Joi.object().keys({
      recipient : Joi.string().required()
    });

    // validate the query data
    const Error = Schema.validate(req.query);

    // check if the query has any error
    if (Error.error) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: Error.error.details[0].message,
            English: "... عذرا خطأ في البيانات المرسلة",
          }),
          400
        )
      );
    }

    // get to the all Physics questions count 
    const QuestionsCount = await Physics.countDocuments({ });


  // create a result
  const results = {
    "message" : "Geted to all questions length",
    "Messages_count" : QuestionsCount
  }

  // sed the response
  res.status(200).send(results);

  } catch (error) {
      // return error
      return next(new ApiErrors(JSON.stringify({
          english : `${error} ...`,
          English : "... عذرا خطأ عام"
        }),
        500
      )
    )
  }
});

module.exports = router;