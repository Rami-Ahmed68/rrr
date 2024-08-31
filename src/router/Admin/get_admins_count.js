const express = require("express");
const router = express.Router();


// api error methods
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../models/Admin/admin");


router.get("/" , async (req , res , next) => {
  try {

    // get to alladmins count
    const AdminsCount = await Admin.countDocuments({});

    // create result
    const result = {
      "message" : "Admins count geted successfully",
      "admins_count" : AdminsCount
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