const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// Api Error function
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// uploading image function using multer
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// delete images function
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// hashing password method
const HashPassword = require("../../../../utils/password_methods/HashPassword");

// upload image to the cloudinary
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// delete avatar from cloudinary cloud method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// validate body data method
const Validate_update_admin = require("../../../../middleware/joi_validation/super_Admin/Admin/Joi_validate_update.admin");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

router.put("/", upload, async (req, res, next) => {
  try {
    // check if the request has more than i avatar
    if (req.files && req.files.length > 1) {
      // to delete all uploaded images from images folder
      DeleteImages(req.files, next);
      // return the error with error message
      return next(
        new ApiErrors("you can not upload more than one image ...", 403)
      );
    }

    // validate body data
    const Error = Validate_update_admin(req.body, next);

    // check if the body data has any error
    if (Error.error) {
      // to delete uploaded avatar
      DeleteImages(req.files, next);

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

    // check if the request has any data
    if (
      !req.body.name &&
      !req.body.gender &&
      !req.body.password &&
      !req.body.phone_number &&
      req.files.length == 0
    ) {
      // // to delete uploaded avatar
      DeleteImages(req.files , next);

      // return error If the body does not have any data
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموح التعديل دون ارسال بيانات جديدة",
          }),
          403
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the admin is exists
    if (!superAdmin) {
      // delete the uploaded avatar
      DeleteImages(req.files, next);

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

    // check if the super admin is ( super admin )
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    // check if the super admin is super admin
    if (!isSuperAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update admin account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل حساب الادمن",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // verify token id with admin id in body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // to delete uploaded avatar
      DeleteImages(req.files, next);

      // return error with failed message
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid super admin data ...",
            arabic: "... عذرا خطأ في بيانات السوبر ادمن",
          }),
          400
        )
      );
    }

    // find the admin by id
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // to delete uploaded avatar
      DeleteImages(req.files, next);

      // return error if the admin is not exists
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

    // update admin acount and return the admin data after updated
    const updateAdmin = await Admin.findByIdAndUpdate(
      { _id: req.body.admin_id },
      {
        $set: {
          name: req.body.name ? req.body.name : admin.name,
          password: req.body.password
            ? await HashPassword(req.body.password)
            : admin.password,
          gender: req.body.gender ? req.body.gender : admin.gender,
          phone_number: req.body.phone_number
            ? req.body.phone_number
            : admin.phone_number,
        },
      },
      { new: true }
    );

    if (req.body.delete_avatar && req.body.delete_avatar == "true") {
      if (req.files && req.files.length > 0) {
        // delete the uploaded images from images folder
        DeleteImages(req.files, next);
      }

      // check if the old avatar is not default avatar
      if (
        admin.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        admin.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete old avatar
        await DeleteCloudinary(admin.avatar, next);
      }

      // set default avatar
      updateAdmin.avatar =
        updateAdmin.gender == "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    } else if (req.body.delete_avatar && req.body.delete_avatar == "false") {
      // check if the request has any image
      if (req.files && req.files.length == 0) {
        // return error if the request hasn't new avatar
        return next(
          new ApiErrors(
            JSON.stringify({
              english: "Sorry, you must send a new avatar ...",
              arabic: "... عذرا يجب ارسال صورة شخصية جديدة",
            }),
            403
          )
        );
      }

      if (
        admin.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        admin.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete old avatar
        await DeleteCloudinary(admin.avatar, next);
      }

      // upload new avatar to cloudinary
      const newAvatar = await UploadCloudinary(req.files[0], next);

      // update the admin avatar
      updateAdmin.avatar = newAvatar;

      // delete the avatar
      DeleteImages(req.files, next);
    }

    // save the admin
    await updateAdmin.save();

    // create result
    const result = {
      message: "Admin account updated successfully",
      admin_data: _.pick(updateAdmin, [
        "_id",
        "name",
        "is_admin",
        "email",
        "avatar",
        "gender",
        "joinde_at",
      ]),
    };

    // send the data to user
    res.status(200).send(result);
  } catch (error) {
    // to delete uploaded avatar
    DeleteImages(req.files, next);

    // return error
    return next(
      new ApiErrors(
        JSON.stringify({
          english: `${error} ...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
