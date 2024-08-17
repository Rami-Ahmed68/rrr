const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// parent model
const Parent = require("../../../../models/Parent/parent");

// student model
const Student = require("../../../../models/Student/student");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// delete images from images folder method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// delete avatar from cloudinary cloud
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// upload avatar to cloudinry cloud method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// validate body data method
const Validate_parent_update = require("../../../../middleware/joi_validation/super_Admin/Parent/Joi_validate_update_parent");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// hashing password method
const HashPassword = require("../../../../utils/password_methods/HashPassword");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

router.put("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_parent_update(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete uploaded avatar
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
    if (req.files && req.files.length > 1) {
      // to delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error with error message
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than one image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من صورة شخصية واحدة",
          }),
          403
        )
      );
    }

    // check if the request has new data
    if (
      !req.body.name &&
      !req.body.password &&
      !req.body.gender &&
      !req.body.children &&
      !req.body.phone_number &&
      req.files.length == 0
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموع التعديل دون ارسال بيانات جديدة",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // delete uploaded image from images folder
      DeleteImages(req.files, next);

      // return error
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

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      //delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
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
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update parent account  ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل حساب ولي الامر ",
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
            arabic: "... عذرا لم يتم العثور على حساب ولي الامر",
          }),
          404
        )
      );
    }

    // find and update parent
    const updateParent = await Parent.findByIdAndUpdate(
      { _id: req.body.parent_id },
      {
        $set: {
          name: req.body.name ? req.body.name : parent.name,
          password: req.body.password
            ? await HashPassword(req.body.password)
            : parent.password,
          gender: req.body.gender ? req.body.gender : parent.gender,
          phone_number: req.body.phone_number
            ? req.body.phone_number
            : parent.phone_number,
        },
      },
      { new: true }
    );

    // create a new array for children
    let childrenArray = JSON.parse(req.body.children) || [];

    if (childrenArray && childrenArray.length > 0) {
      updateParent.children = [];

      for (let i = 0; i < childrenArray.length; i++) {
        // find the student
        const student = await Student.findById(childrenArray[i]);

        // check if the student is exists
        if (!student) {
          // delete all uploaded images from imgaes folder
          DeleteImages(req.files, next);

          // return error
          return next(
            new ApiErrors(
              JSON.stringify({
                english: "Sorry, invalid student's id ...",
                arabic: "... عذرا خطأ في معرفات الطلاب",
              }),
              404
            )
          );
        }

        if (!updateParent.children.includes(childrenArray[i])) {
          updateParent.children.push(childrenArray[i]);
        }
      }
    } else {
      updateParent.children = [];
    }

    // check if the request has delete avatar
    if (req.body.delete_avatar && req.body.delete_avatar == "true") {
      if (req.files && req.files.length > 0) {
        // delete the uploaded images from images folder
        DeleteImages(req.files, next);
      }

      // check if the old avatar is not default avatar
      if (
        parent.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
        parent.avatar != process.env.DEFAULT_MAN_AVATAR
      ) {
        // delete old avatar
        await DeleteCloudinary(parent.avatar, next);
      }

      // set a default avatar
      updateParent.avatar =
        updateParent.gender == "male"
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

    // save the changes
    await updateParent.save();

    // create result
    const result = {
      message: "Parent account updated successfully",
      parent_data: _.pick(updateParent, [
        "_id",
        "avatar",
        "email",
        "gender",
        "children",
      ]),
    };

    res.status(200).send(result);
  } catch (error) {
    // delete all uploaded images from images folder
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
