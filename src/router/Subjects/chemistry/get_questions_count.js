const express = require("express");
const router = express.Router();


// Chemistry model
const Chemistry = require("../../../models/Subjects_Banks/chemistry/chemistry");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // get to the all chemistry questions count 
    const QuestionsCount = await Chemistry.countDocuments({ });


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
          chemistry : "... عذرا خطأ عام"
        }),
        500
      )
    )
  }
});

module.exports = router;