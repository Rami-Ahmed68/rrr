const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "/config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// student model
const Student = require("../../../../models/Student/student");

// error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// delete uploaded images method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// validate create student method
const Validate_student_create = require("../../../../middleware/joi_validation/Admin/Student/Joi_validate_create_student");

// check  admin
const CheckAdmin = require("../../../../middleware/CheckAdmin");

// hashing password method
const HashingPassword = require("../../../../utils/password_methods/HashPassword");

// uploading cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// veryfi token data
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

router.post("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_student_create(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete all uploaded images
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

    // check if the request has more than i avatar
    if (req.files.length > 1) {
      // to delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error with error message
      return next(
        new ApiErrors(
          JSON.string({
            english: "Sorry, you can not upload more than one image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من صورة شخصية",
          }),
          403
        )
      );
    }

    // find the  admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the  admin is exists
    if (!admin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      //return the error
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

    // check if the  admin is  admin
    const isAdmin = CheckAdmin(admin);

    if (!isAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to create student account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء حساب طالب",
          }),
          403
        )
      );
    }

    // verify toke data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the  admin id in token is equal the id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error
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

    // find the student by his email
    const StudentEmail = await Student.findOne({ email: req.body.email });

    // check if the email is already used
    if (StudentEmail) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Invalid email is already use ...",
            arabic: "... عذرا الايميل مستخدم بالفعل",
          }),
          403
        )
      );
    }

    // hashing password
    const HashedPassword = await HashingPassword(req.body.password);

    // create student
    const student = new Student({
      name: req.body.name,
      birth_date: req.body.birth_date,
      email: req.body.email,
      password: HashedPassword,
      gender: req.body.gender,
      my_plans: [],
      about_me: req.body.about_me ? req.body.about_me : "",
      class_level: req.body.class_level,
      created_by: req.body.admin_id,
    });

    // check if the request has a image upload it to cloudinary
    if (req.files.length > 0) {
      // upload the avatar to cloudinary cloud
      const uploadedAvatar = await UploadCloudinary(req.files[0], next);

      // set the uploaded avatar to the student
      student.avatar = uploadedAvatar;

      // delete the uploaded images from images folder
      DeleteImages(req.files, next);
    } else {
      // set the default avatar
      student.avatar =
        req.body.gender == "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    }

    // save the student in data base
    await student.save();

    // create result
    const result = {
      message: "Student account created successfully",
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

    // send the result to the user
    res.status(200).send(result);
  } catch (error) {
    // delete all uploaded images from images folder
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
