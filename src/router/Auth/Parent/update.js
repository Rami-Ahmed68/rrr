const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// parent model
const Parent = require("../../../models/Parent/parent");

// validate update body data method
const Validate_parent_update = require("../../../middleware/joi_validation/Parent/Joi_validate_update");

// upload avatar method
const upload = require("../../../utils/multer/upload_avatar/uploadeMulter");

// delete images method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// verify toke data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// hashing password method
const HashingPassword = require("../../../utils/password_methods/HashPassword");

// upload cloudinary
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

router.put("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_parent_update(req.body);

    // check if the body data
    if (Error.error) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
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

    // check if the request has new data
    if (
      !req.body.name &&
      !req.body.password &&
      !req.body.phone_number &&
      !req.body.delete_avatar &&
      req.files.length == 0
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموح بالتحديث دون ارسال بيانات جديدة",
          }),
          403
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

    // find the parent
    const parent = await Parent.findById(req.body.parent_id);

    // check if the parent is exists
    if (!parent) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, parent not found ...",
            arabic: "... عذرا لم يتم العثور على حساب ولي الأمر",
          }),
          404
        )
      );
    }

    // verify toke data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the parent id in body is eqaul id in token
    if (VerifyTokenData._id != req.body.parent_id) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid parent data ...",
            arabic: "... عذرا خطأ في بيانات ولي الأمر",
          }),
          404
        )
      );
    }

    // find and upadte the parent
    const updateParent = await Parent.findByIdAndUpdate(
      { _id: req.body.parent_id },
      {
        $set: {
          name: req.body.name ? req.body.name : parent.name,
          gender: req.body.gender ? req.body.gender : parent.gender,
          password: req.body.password
            ? await HashingPassword(req.body.password)
            : parent.password,
            phone_number : req.body.phone_number ? req.body.phone_number : parent.phone_number,
        },
      },
      { new: true }
    );

    // check if the request has any image
    if (req.body.delete_avatar && req.body.delete_avatar == "true") {
      if (req.files.length > 0) {
        // delete the uploaded images from images folder
        DeleteImages(req.files, next);
      }

      // check if the old avatar is not default avatar
      if (
        updateParent.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        updateParent.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete old avatar
        await DeleteCloudinary(parent.avatar, next);
      }

      // set a default avatar
      updateParent.avatar =
        update.gender == "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    } else if (req.body.delete_avatar && req.body.delete_avatar == "false") {
      // check if the request has any image
      if (req.files.length == 0) {
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
        parent.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        parent.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete old avatar
        await DeleteCloudinary(parent.avatar, next);
      }

      // upload new avatar to cloudinary
      const newAvatar = await UploadCloudinary(req.files[0], next);

      // update the admin avatar
      updateParent.avatar = newAvatar;

      // delete the avatar
      DeleteImages(req.files, next);
    }

    // create result
    const result = {
      message: "Parent account updated successfully",
      user_data: _.pick(updateParent, [
        "_id",
        "name",
        "avatar",
        "phone_number",
        "children",
        "gender",
      ]),
    };

    // send the result to user
    res.status(200).send(result);
  } catch (error) {
    // delete all uploaded images from images folder
    DeleteImages(req.files, next);

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
