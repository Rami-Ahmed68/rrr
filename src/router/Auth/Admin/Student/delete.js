const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config.env" });

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// validate body data method
const Validate_student_delete = require("../../../../middleware/joi_validation/Admin/Student/Joi_validate_delete_student");

// admin model
const Admin = require("../../../../models/Admin/admin");

// student model
const Student = require("../../../../models/Student/student");

// check  admin method
const CheckAdmin = require("../../../../middleware/CheckAdmin");

// veryfi token data
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// delete cloudinary method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_student_delete(req.body);

    // check if the body data has any error return it
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

    // find the  admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the  admin exists
    if (!admin) {
      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرلم يتم العثور على حساب الأدمن",
          }),
          404
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the  admin id in token is eqaul id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الأدمن",
          }),
          400
        )
      );
    }

    // check if the  adin is  admin
    const isAdmin = CheckAdmin(admin);

    if (!isAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to delete student account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف حساب الطالب",
          }),
          403
        )
      );
    }

    // find the student
    const student = await Student.findById(req.body.student_id);

    // check if the student is exists
    if (!student) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, student not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الطالب",
          }),
          404
        )
      );
    }

    // check if the student avatar is not default avatar and delete it
    if (
      student.avatar != process.env.DEFAULT_MAN_AVATAR &&
      student.avatar != process.env.DEFAULT_WOMAN_AVATAR
    ) {
      // delete the avatar from cloudinary cloud
      await DeleteCloudinary(student.avatar);
    }

    // delete the student from data base
    await Student.deleteOne(student._id);

    // create result
    const result = {
      message: "Student deleted successfully",
      student_data: _.pick(student, [
        "_id",
        "name",
        "avatar",
        "email",
        "about_me",
        "phone_number",
        "gender",
        "finished_exams",
        "points",
        "total_gpa",
        "classes",
        "plans",
        "class_level",
        "joind_at",
      ]),
    };

    // send the result to user
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
