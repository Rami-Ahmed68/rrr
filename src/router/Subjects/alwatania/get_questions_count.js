const express = require("express");
const router = express.Router();
const Joi = require("joi");


// Alwatania model
const Alwatania = require("../../../models/Subjects_Banks/alwatania/alwatania");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

      // get to the all Alwatania questions count 
      const QuestionsCount = await Alwatania.countDocuments({ });

  // create a result
  const results = {
    "message" : "Geted to all questions length",
    "Questions_count" : QuestionsCount
  }

  // sed the response
  res.status(200).send(results);

  } catch (error) {
      // return error
      return next(new ApiErrors(JSON.stringify({
          english : `${error} ...`,
          arabic : "... عذرا خطأ عام"
        }),
        500
      )
    )
  }
});

module.exports = router;