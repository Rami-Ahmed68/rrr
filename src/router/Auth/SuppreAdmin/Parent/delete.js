const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// parent model
const Parent = require("../../../../models/Parent/parent");

// Api Error function
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// validate body data method
const Validate_parent_delete = require("../../../../middleware/joi_validation/super_Admin/Parent/Joi_validate_delete_parent");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// delete avatar from cloudinary cloud method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_parent_delete(req.body);

    // check if the body data has any error
    if (Error.error) {
      // return the error
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

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is eqaul idin body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid super admin data ...",
            arabic: "... عذرا خطأ في بيانات الصوبر ادمن",
          }),
          400
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, super admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب السوبر ادمن",
          }),
          404
        )
      );
    }

    // check if the super admin is super admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    if (!isSuperAdmin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to delete parent account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف حساب ولي الامر",
          }),
          403
        )
      );
    }

    // find the parent
    const parent = await Parent.findById(req.body.parent_id);

    // check if the parent is exists
    if (!parent) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, parent not found ...",
            arabic: "... عذرا لم يتم العثور على حساب ولي الامر",
          }),
          404
        )
      );
    }

    // check if the parent avatar is not default avatar delete it
    if (
      parent.avatar != process.env.DEFAULT_MAN_AVATAR &&
      parent.avatar != process.env.DEFAULT_WOMAN_AVATAR
    ) {
      // delete the parent avatar from cloudinary
      await DeleteCloudinary(parent.avatar);
    }

    // delete the parent account from data base
    await Parent.deleteOne(parent._id);

    // craeteresult
    const result = {
      message: "Parent account deleted successfully",
      parent_data: _.pick(parent, [
        "_id",
        "name",
        "email",
        "avatar",
        "gender",
        "children",
      ]),
    };

    // send the result to use
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
