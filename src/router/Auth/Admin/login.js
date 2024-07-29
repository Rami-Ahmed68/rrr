const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// admin model
const Admin = require("../../../models/Admin/admin");

// Api error function
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// validate login body data
const Validate_admin_login = require("../../../middleware/joi_validation/Admin/Joi_validate_login");

// comapre password's
const compare = require("../../../utils/password_methods/Compaer_Password");

// generate token
const GenerateToken = require("../../../utils/token_methods/GenerateToken");

router.post("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_admin_login(req.body, next);

    // check if the request data has any error
    if (Error.error) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: Error.error.details[0].message,
            arabic: "... عذرا خطأ في البيانات المرسلة",
          }),
          400
        )
      );
    }

    // find the admin
    const admin = await Admin.findOne({ email: req.body.email });

    // check if the admin exists or not
    if (!admin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid email or password ...",
            arabic: "... عذرا خطأ في الايميل او كلمة المرور",
          }),
          404
        )
      );
    }

    // compare the body password with the the password in data base
    const Compaer_Password = await compare(req.body.password, admin.password);

    // check if the body password is equal the admin password or not
    if (!Compaer_Password) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid email or password ...",
            arabic: "... عذرا خطأ في الايميل او كلمة المرور",
          }),
          403
        )
      );
    }

    // generate new token
    const token = GenerateToken(admin._id, admin.email);

    // create result
    const result = {
      message: "Loged in successfully",
      user_data: _.pick(admin, [
        "_id",
        "name",
        "is_admin",
        "is_supper_admin",
        "email",
        "avatar",
        "gender",
        "phone_number",
        "joined_at",
        "rate",
      ]),
      token: token,
    };

    // send the data
    res.status(200).send(result);
  } catch (error) {
    // return the error
    return next(
      new ApiErrors(
        JSON.stringify({
          english: error,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
