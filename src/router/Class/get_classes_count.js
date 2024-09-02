const express = require("express");
const router = express.Router();

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// classes model
const ClassSchema = require("../../models/Class/class");

router.get("/" , async (req , res , next) => {
  try {

    // get to all classes dount
    const ClassesCount = await ClassSchema.countDocuments({});

    // create result
    const result = {
      "message" : "Classes count getde successfully",
      "classes_count" : ClassesCount
    };

    // send the response
    res.status(200).send(result);

  } catch (error) {
    // return the error
      return next(new ApiErrors(JSON.stringify({
        english : `${error} ...`,
        arabic : "... عذرا خطأ عام"
      }) , 500)
    )
  } 
});

module.exports = router;