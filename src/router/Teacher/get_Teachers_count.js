const express = require("express");
const router = express.Router();


// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../models/Teacher/teacher");


router.get("/" , async (req , res , next) => {
  try {

    // get to all teachers count
    const TeachersCount = await Teacher.countDocuments({});

    // create result
    const result = {
      "message" : "Teacher count geted successfully",
      "teachers_count" : TeachersCount
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