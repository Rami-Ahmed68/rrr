const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// admin model
const Admin = require("../../../models/Admin/admin");

// Api Error function
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// uploading image function using multer
const upload = require("../../../utils/multer/upload_avatar/uploadeMulter");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// delete images function
const DeleteImages = require("../../../utils/multer/DeleteImages");

// validate super admin update method
const Validate_super_admin_update = require("../../../middleware/joi_validation/super_Admin/Joi_validate_update");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// hashing password method
const HashPassword = require("../../../utils/password_methods/HashPassword");

// upload avatar to cloudinry cloud method
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// delete the avatar from cloudinary cloud
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

router.put("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_super_admin_update(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete the uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error message
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

    // check if the request has more than i avatar
    if (req.files.length > 1) {
      // to delete all uploaded images from images folder
      DeleteImages(req.files, next);
      // return the error with error message
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than one image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من صورة شخصية",
          }),
          403
        )
      );
    }

    // check if the request has any data
    if (
      !req.body.name &&
      !req.body.gender &&
      !req.body.password &&
      req.files.length == 0
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموح التعديل دون بيانات جديدة",
          }),
          403
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      // delete uploaded images from images folder
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
    } else {
      const isSuperAdmin = CheckSuperAdmin(superAdmin);

      // check if the super admin is super admin
      if (!isSuperAdmin) {
        // delete uploaded images from images folder
        DeleteImages(req.files, next);

        // return the error
        return next(
          new ApiErrors(
            JSON.stringify({
              english: "Sorry, this account is not super admin ...",
              arabic: "... عذرا هذا الحساب ليس حساب سوبر أدمن ",
            }),
            403
          )
        );
      }
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in body is equal the id in token
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // delete uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error
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

    // find and update super admin
    const updateSuperAdmin = await Admin.findByIdAndUpdate(
      { _id: req.body.super_admin_id },
      {
        $set: {
          name: req.body.name ? req.body.name : superAdmin.name,
          password: req.body.password
            ? await HashPassword(req.body.password)
            : superAdmin.password,
          gender: req.body.gender ? req.body.gender : superAdmin.gender,
        },
      },
      { new: true }
    );

    // check if the request has new avatar upload it to cloudinary
    if (req.body.delete_avatar && req.body.delete_avatar == "true") {
      if (req.files.length > 0) {
        DeleteImages(req.files, next);
      }

      // check if the old avatar is not a default avatar
      if (
        superAdmin.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        superAdmin.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete the old avatar from cloudinary
        await DeleteCloudinary(superAdmin.avatar, next);
      }

      // set the default avatar
      updateSuperAdmin.avatar =
        updateSuperAdmin.gender == "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    } else if (req.body.delete_avatar && req.body.delete_avatar == "false") {
      // check if the request has not any new avatar
      if (req.files.length == 0) {
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

      // check if the old avatar is not a default avatar
      if (
        superAdmin.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        superAdmin.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete the old avatar from cloudinary
        await DeleteCloudinary(superAdmin.avatar, next);
      }

      // upload new avatar to cloudinary
      const newAvatar = await UploadCloudinary(req.files[0], next);

      // set the new avatar to updateSuperAdmin
      updateSuperAdmin.avatar = newAvatar;

      // delete the uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the changes
    await updateSuperAdmin.save();

    // create result
    const result = {
      message: "Super admin acount updated successfully",
      user_data: _.pick(updateSuperAdmin, [
        "_id",
        "name",
        "is_supper_admin",
        "email",
        "avatar",
        "gender",
        "joinde_at",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    // delete images
    DeleteImages(req.files, next);

    // return the error
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
