const express = require("express");
const router = express.Router();


// Religion model
const Religion = require("../../../models/Subjects_Banks/Religion/Religion");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {
    // get to the all Religion questions count 
    const QuestionsCount = await Religion.countDocuments({ });

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