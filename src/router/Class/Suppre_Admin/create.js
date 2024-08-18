const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// admin model
const Admin = require("../../../models/Admin/admin");

// class model
const ClassSchema = require("../../../models/Class/class");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// validate body data method
const Validate_class_create = require("../../../middleware/joi_validation/super_Admin/Class/Joi_validate_create_class");

// delete image from images folder
const DeleteImages = require("../../../utils/multer/DeleteImages");

// upload cover method
const upload_cover = require("../../../utils/multer/upload_cover/uploadeMulter");

// upload cloudinary cloud method
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// check super admin
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.post("/", upload_cover, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_class_create(req.body);

    // check if the body data has any error
    if (Error.error) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }

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

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the admin is exists
    if (!superAdmin) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }

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

    // check if the admin is admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    if (!isSuperAdmin) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to create class ...",
            arabic: "... عذرا ليس لديك السلاحيات السوبر ادمن لإنشاء صف جديد",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is eqaul id in bofy
    if (VerifyTokenData._id != req.body.super_admin_id) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid super admin data ...",
            arabic: "... عذرا لا خطأ في بيانات السوبر ادمن",
          }),
          400
        )
      );
    }

    // check if the class title is exists
    const ClassTitle = await ClassSchema.findOne({ title: req.body.title });

    // check if the class title is exists return error
    if (ClassTitle) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, the class title is already use ...",
            arabic: "... عذرا عنوان الصف مستخدم بالفعل",
          }),
          403
        )
      );
    }

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check if the teacher is exists
    if (!teacher) {
      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, teacher not found ...",
            arabic: "... عذرا لم يتم العثور على حساب المدرس",
          }),
          404
        )
      );
    }

    // craete class object
    const classObject = new ClassSchema({
      title: req.body.title,
      subject: req.body.subject,
      note: req.body.note ? req.body.note : "",
      created_by_type: "admin",
      created_by: req.body.super_admin_id,
      teacher: req.body.teacher_id,
      class_level: req.body.class_level,
    });

    // check if the body has any image and upload it to cloudinary
    if (req.files && req.files.length > 0) {
      // upload the cover to cloudinary
      const cover = await UploadCloudinary(req.files[0], next);

      // set the avatar to class
      classObject.cover = cover;

      if (req.files && req.files.length > 0) {
        // delete all uploaded images
        DeleteImages(req.files, next);
      }
    } else {
      // set default cover
      switch (req.body.subject) {
        case "Math":
          classObject.cover = process.env.DEFAULT_COVER_MATH;
          break;
        case "History":
          classObject.cover = process.env.DEFAULT_COVER_HISTORY;
          break;
        case "Arabic":
          classObject.cover = process.env.DEFAULT_COVER_ARABIC;
          break;
        case "English":
          classObject.cover = process.env.DEFAULT_COVER_ENGLISH;
          break;
        case "French":
          classObject.cover = process.env.DEFAULT_COVER_FRENCH;
          break;
        case "Philosophy":
          classObject.cover = process.env.DEFAULT_COVER_PHILOSOPHY;
          break;
        case "Physics":
          classObject.cover = process.env.DEFAULT_COVER_PHYSICS;
          break;
        case "Sciences":
          classObject.cover = process.env.DEFAULT_COVER_SCIENCES;
          break;
        case "Islam":
          classObject.cover = process.env.DEFAULT_COVER_ISLAM;
          break;
        case "Geography":
          classObject.cover = process.env.DEFAULT_COVER_GEOGRAPHY;
          break;
        case "Chemistry":
          classObject.cover = process.env.DEFAULT_COVER_CHEMISTRY;
          break;
        case "Alwatania":
          classObject.cover = process.env.DEFAULT_COVER_ALWATANIA;
          break;
        default:
      }
    }

    // save the changes
    await classObject.save();

    // add the class id to theteacher classes array
    teacher.classes.push(classObject._id);

    // save the teacher after add the class id
    await teacher.save();

    // create result
    const result = {
      message: "Class created successfully",
      class_data: _.pick(classObject, [
        "_id",
        "title",
        "cover",
        "teacher",
        "students",
        "subject",
        "note",
        "home_works",
        "class_level",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    if (req.files && req.files.length > 0) {
      // delete all uploaded images
      DeleteImages(req.files, next);
    }

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
