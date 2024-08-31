const express = require("express");
const router = express.Router();


// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// plan model
const Plan = require("../../models/Plan/plan");


router.get("/" , async (req , res , next) => {
  try {

    // get to all parents count
    const PlansCount = await Plan.countDocuments({});

    // create result
    const result = {
      "message" : "Plans count geted successfully",
      "Plans_count" : PlansCount
    };

    // send the response
    res.status(200).send(result);

  } catch (error) {
    // return error
    return next(new ApiErrors( JSON.stringify({
      english : `${error} ...`,
      arabic : "... عذرا خطأ عام"
    }), 500));
  }
});


module.exports = router;