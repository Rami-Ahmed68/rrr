const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// teacher model
const Teacher = require("../../../../models/Teacher/teacher");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// validate body data
const Validate_teacher_update = require("../../../../middleware/joi_validation/super_Admin/Teacher/Joi_validate_update_teacher");

// delete images method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// hashing password method
const HashinPassword = require("../../../../utils/password_methods/HashPassword");

// uploading cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// delete avatar from cloudinary cloud method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// verify token data
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

router.put("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_teacher_update(req.body.data);

    // check if the body data has any error
    if (Error.error) {
      // delete all uploaded images from images folder
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

    // check if the body has new data
    if (
      !req.body.name &&
      !req.body.password &&
      !req.body.gender &&
      !req.body.class_level &&
      !req.body.birth_date &&
      req.body.about_me &&
      !req.body.delete_avatar
    ) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error If the body does not have any data
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموح بالتعديل دون ارسال بيانات جديدة",
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

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      // delete all uploaded images from images folder
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

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in body is equal the id in token
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // delete all uploaded images from images folder
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

    // check if the super admin is super admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    if (!isSuperAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update teacher account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل حساب المدرس",
          }),
          403
        )
      );
    }

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check if the teacher is exists
    if (!teacher) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, teacher not found ...",
            arabic: "... عذرا لم يتم العثور على حساب المدرس",
          }),
          403
        )
      );
    }

    // find and update teacher
    const updateTeacher = await Teacher.findByIdAndUpdate(
      { _id: req.body.teacher_id },
      {
        $set: {
          name: req.body.name ? req.body.name : teacher.name,
          password: req.body.name
            ? await HashinPassword(req.body.name)
            : teacher.name,
          gender: req.body.gender ? req.body.gender : teacher.gender,
          editor: req.body.editor ? req.body.editor : teacher.editor,
          subject: req.body.subject ? req.body.subject : teacher.subject,
          about_me: req.body.about_me ? req.body.about_me : teacher.about_me,
          class_level: req.body.class_level
            ? req.body.class_level
            : teacher.class_level,
          phone_number : req.body.phone_number ? req.body.phone_number : teacher.phone_number
        },
      },
      { new: true }
    );

    if (req.body.delete_avatar && req.body.delete_avatar == "true") {
      // check if the request has nay image and delete it
      if (req.files.length > 0) {
        // delete all uploaded images from images folder
        DeleteImages(req.files, next);
      }

      if (
        teacher.avatar != process.env.DEFAULT_MAN_AVATAR &&
        teacher.avatar != process.env.DEFAULT_WOMAN_AVATAR
      ) {
        // delete the old avatar
        await DeleteCloudinary(teacher.avatar);
      }

      //set the default avatar
      updateTeacher.avatar =
        updateTeacher.gender == "male"
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
        teacher.avatar != process.env.DEFAULT_MAN_AVATAR &&
        teacher.avatar != process.env.DEFAULT_WOMAN_AVATAR
      ) {
        // delete the old avatar
        await DeleteCloudinary(teacher.avatar);
      }

      // upload new avatar to cloudinary cloud
      const newAvatar = await UploadCloudinary(req.files[0], next);

      // set the new avatar to udate teacher
      updateTeacher.avatar = newAvatar;

      // delete the uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the changes
    await updateTeacher.save();

    // create result
    const result = {
      message: "Teacher updated successfully",
      teacher_data: _.pick(updateTeacher, [
        "_id",
        "name",
        "avatar",
        "editor",
        "email",
        "subject",
        "about_me",
        "gender",
      ]),
    };

    // send the result to user
    res.status(200).send(result);
  } catch (error) {
    // delete all uploaded images
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
