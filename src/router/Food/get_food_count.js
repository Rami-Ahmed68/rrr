const express = require("express");
const router = express.Router();

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// food model
const Food = require("../../models/Food/food");

router.get("/" , async (req , res , next ) => {
  try {

    // get to all foods count
    const FoodsCount = await Food.countDocuments({});

    // create a result
    const result = {
      "message" : "Foods Count Geted Successfully",
      "foods_count" : FoodsCount
    };

    // send the response
    res.status(200).send(result);
  } catch (error) {
    // return the error
    return next(new ApiErrors(JSON.stringify({
      english : `${error} ...`,
      arabic : "... عذرا خطأ عام"
    }) , 500));
  }
});

module.exports = router;