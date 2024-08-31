const express = require("express");
const router = express.Router();


// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../models/Student/student");


router.get("/" , async (req , res , next) => {
  try {

    // get to all students count
    const StudentsCount = await Student.countDocuments({});

    // create result
    const result = {
      "message" : "Parents count geted successfully",
      "students_count" : StudentsCount
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