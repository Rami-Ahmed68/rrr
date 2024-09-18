const express = require("express");
const router = express.Router();


// History model
const History = require("../../../models/Subjects_Banks/History/history");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // get to the all History questions count 
    const QuestionsCount = await History.countDocuments({ });

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
          English : "... عذرا خطأ عام"
        }),
        500
      )
    )
  }
});

module.exports = router;