const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// Api Error function
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// validation body data method
const Validate_delete_admin = require("../../../../middleware/joi_validation/super_Admin/Admin/Joi_validate_delete_admin");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// delete avatar from cloudinary method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_delete_admin(req.body);

    // check if the body data has any error
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
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الأدمن",
          }),
          404
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, super admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب السوبر أدمن",
          }),
          404
        )
      );
    }

    // check if the super admin is super admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    // check if the super admin is super admin
    if (!isSuperAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to delete admin account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف حساب الأدمن",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if super admin id is equal id in token
    if (VerifyTokenData._id != req.body.super_admin_id) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, super admin data ...",
            arabic: "... خطأ في بيانات السوبر أدمن",
          }),
          400
        )
      );
    }

    // check if the admin avatar is not default avatars delete it
    if (
      admin.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
      admin.avatar != process.env.DEFAULT_MAN_AVATAR
    ) {
      await DeleteCloudinary(admin.avatar);
    }

    // delete the admin
    await Admin.deleteOne(admin._id);

    // create result
    const result = {
      message: "admin deleted successfully",
      admin_data: _.pick(admin, [
        "_id",
        "name",
        "is_admin",
        "email",
        "avatar",
        "gender",
        "joinde_at",
        "rate",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    return next(
      new ApiErrors(
        JSON.stringify({
          english: error,
          arabic: "... خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
