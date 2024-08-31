const express = require("express");
const router = express.Router();

// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// home works model
const HomeWork = require("../../models/HomeWork/homeWork");


router.get("/" , async (req , res , next) => {
  try {

    // get to all home works count
    const HomeWorksCount = await HomeWork.countDocuments({});

    // create a result
    const result = {
      "message" : "Home Works count geted successfully",
      "home_work_count" : HomeWorksCount
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