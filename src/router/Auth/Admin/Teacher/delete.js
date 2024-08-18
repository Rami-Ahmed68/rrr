const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// Api Error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../../models/Admin/admin");

// class model
const ClassSchema = require("../../../../models/Class/class");

// teacher model
const Teacher = require("../../../../models/Teacher/teacher");

// check  admin method
const CheckAdmin = require("../../../../middleware/CheckAdmin");

// validate delete data method
const Validate_teacher_delete = require("../../../../middleware/joi_validation/Admin/Teacher/Joi_validate_delete_teacher");

// delete avatar from cloudinary cloud
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// verify token data
const VeryfiToken = require("../../../../utils/token_methods/VerifyToken");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_teacher_delete(req.body);

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

    // find the  admin
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

    // veryfi token data
    const VeryfiTokenData = await VeryfiToken(req.headers.authorization, next);

    // check if the  admin id in body is equal the id in token
    if (VeryfiTokenData._id != req.body.admin_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الأدمن",
          }),
          400
        )
      );
    }

    // check if the editor is admin
    const isAdmin = CheckAdmin(admin);

    // check if the editor is admin
    if (!isAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to delete teacher account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف حساب المدرس ",
          }),
          403
        )
      );
    }

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check if the teacher is exists
    if (!teacher) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, teacher not found ...",
            arabic: "... عذرا لم يتم العثور لى حساب المدرس",
          }),
          404
        )
      );
    }

    // check if the teacher is teacher on any class
    if (teacher.classes.length > 0) {
      // loop on the teacher classes
      for (let i = 0; i < teacher.classes.length; i++) {
        // get the class
        const teacherClass = await ClassSchema.findById(teacher.classes[i]);

        // check if the teacher class is exists
        if (teacherClass) {
          // return error
          return next(
            new ApiErrors(
              JSON.stringify({
                english:
                  "Sorry, the teacher's account cannot be deleted because some classes are approved for it ...",
                arabic:
                  "... عذرا لا يمكن حذف حساب المدرس لأن يعض الصفوف تابعة له",
              }),
              403
            )
          );
        }
      }
    }

    // delete the teacher from data base
    await Teacher.deleteOne(teacher._id);

    // check if the teacher avatar is not a default avatar delete it
    if (
      teacher.avatar != process.env.DEFAULT_WOMAN_AVATAR &&
      teacher.avatar != process.env.DEFAULT_MAN_AVATAR
    ) {
      // delete the teacher avatar from cloudinary cloud
      await DeleteCloudinary(teacher.avatar);
    }

    // create result
    const result = {
      message: "Teacher deleted account successfully",
      teacher_data: _.pick(teacher, [
        "_id",
        "name",
        "email",
        "avatar",
        "about_me",
        "gender",
        "subject",
        "editor",
      ]),
    };

    // send the result to user
    res.status(200).send(result);
  } catch (error) {
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
