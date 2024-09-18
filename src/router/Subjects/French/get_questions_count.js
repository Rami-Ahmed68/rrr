const express = require("express");
const router = express.Router();


// French model
const French = require("../../../models/Subjects_Banks/French/french");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // get to the all French questions count 
    const QuestionsCount = await French.countDocuments({ });

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