const express = require("express");
const router = express.Router();


// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// parent model
const Parent = require("../../models/Parent/parent");


router.get("/" , async (req , res , next) => {
  try {

    // get to all parents count
    const ParentsCount = await Parent.countDocuments({});

    // create result
    const result = {
      "message" : "Parents count geted successfully",
      "parents_count" : ParentsCount
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