const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

//api error
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// class model
const Class = require("../../../models/Class/class");

// admin model
const Admin = require("../../../models/Admin/admin");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// upload cover method
const upload_cover = require("../../../utils/multer/upload_cover/uploadeMulter");

// validate body data method
const Validate_class_update = require("../../../middleware/joi_validation/Teacher/Class/Joi_validate_update_class");

// delete image from cloudinary cloud method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// check admin method
const CheckEditor = require("../../../middleware/CheckEditor");

// delete image from cloudinary cloud method
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// upload image to cloudinary cloud method
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// default cover images array
const Default_covers = [
  process.env.DEFAULT_COVER_HISTORY,
  process.env.DEFAULT_COVER_GEOGRAPHY,
  process.env.DEFAULT_COVER_PHILOSOPHY,
  process.env.DEFAULT_COVER_MATH,
  process.env.DEFAULT_COVER_SCIENCES,
  process.env.DEFAULT_COVER_PHYSICS,
  process.env.DEFAULT_COVER_CHEMISTRY,
  process.env.DEFAULT_COVER_ENGLISH,
  process.env.DEFAULT_COVER_FRENCH,
  process.env.DEFAULT_COVER_ARABIC,
  process.env.DEFAULT_COVER_ISLAM,
  process.env.DEFAULT_COVER_ALWATANIA,
];

router.put("/", upload_cover, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_class_update(req.body);

    // check if the body data has any error
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

    // check if the request has more than one image
    if (req.files && req.files.length > 1) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than one image ...",
            arabic: "... عذرا لا يمكنك ارسال من صورة غلاف",
          }),
          403
        )
      );
    }

    // chec if thebody has any new data
    if (
      !req.body.title &&
      !req.body.teacher_id &&
      !req.body.class_id &&
      !req.body.note &&
      req.files.length == 0 &&
      !req.body.class_level
    ) {
      // return error
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

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check if the teacher is exists
    if (!teacher) {
      // delete all uploaded images
      DeleteImages(req.files, next);

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

    // check if the teacher is editor
    const isEditor = CheckEditor(teacher);

    // check if the teacher is editor
    if (!isEditor) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to update class ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل الصف",
          }),
          403
        )
      );
    }

    // find the class
    const classObject = await Class.findById(req.body.class_id);

    // check if the class is exists
    if (!classObject) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, class not found ...",
            arabic: "... عذرا لم يتم العثور على الصف",
          }),
          404
        )
      );
    }

    // find and update the class
    const updateClassObject = await Class.findByIdAndUpdate(
      { _id: req.body.class_id },
      {
        $set: {
          title: req.body.title ? req.body.title : classObject.title,
          note: req.body.note ? req.body.note : classObject.note,
          class_level: req.body.class_level
            ? req.body.class_level
            : classObject.class_level,
        },
      },
      { new: true }
    ).populate([
      {
        path: "teacher",
        select: "_id name avatar",
      },
      {
        path: "students",
        select: "_id name avatar",
      },
      {
        path: "home_works",
        select: "_id title cover",
      },
    ]);

    if (req.body.delete_cover && req.body.delete_cover == "true") {
      // check if the class cover is not default cover and delete it
      if (!Default_covers.includes(classObject.cover)) {
        await DeleteCloudinary(classObject.cover , next);
      }

      if (req.files && req.files.length > 0) {
        // delete all uploaded images from images folder
        DeleteImages(req.files, next);
      }

      // set the default cover
      switch (updateClassObject.subject) {
        case "Math":
          updateClassObject.cover = process.env.DEFAULT_COVER_MATH;
          break;
        case "History":
          updateClassObject.cover = process.env.DEFAULT_COVER_HISTORY;
          break;
        case "Arabic":
          updateClassObject.cover = process.env.DEFAULT_COVER_ARABIC;
          break;
        case "English":
          updateClassObject.cover = process.env.DEFAULT_COVER_ENGLISH;
          break;
        case "French":
          updateClassObject.cover = process.env.DEFAULT_COVER_FRENCH;
          break;
        case "Philosophy":
          updateClassObject.cover = process.env.DEFAULT_COVER_PHILOSOPHY;
          break;
        case "Physics":
          updateClassObject.cover = process.env.DEFAULT_COVER_PHYSICS;
          break;
        case "Sciences":
          updateClassObject.cover = process.env.DEFAULT_COVER_SCIENCES;
          break;
        case "Islam":
          updateClassObject.cover = process.env.DEFAULT_COVER_ISLAM;
          break;
        case "Geography":
          updateClassObject.cover = process.env.DEFAULT_COVER_GEOGRAPHY;
          break;
        case "Chemistry":
          updateClassObject.cover = process.env.DEFAULT_COVER_CHEMISTRY;
          break;
        case "Alwatania":
          updateClassObject.cover = process.env.DEFAULT_COVER_ALWATANIA;
          break;
        default:
      }
    } else if (req.body.delete_cover && req.body.delete_cover == "false") {
      // check if the request has not any  image
      if (req.files.length == 0) {
        // return error
        return next(
          new ApiErrors(
            JSON.stringify({
              english: "Sorry, you must send a new cover image ...",
              arabic: "... عذرا يجب ارسال صور غلاف جديدة",
            }),
            403
          )
        );
      }

      // check if the class cover is not default cover and delete it
      if (!Default_covers.includes(classObject.cover)) {
        await DeleteCloudinary(classObject.cover , next);
      }

      // upload the new cover
      const newCover = await UploadCloudinary(req.files[0], next);

      // set the cover
      updateClassObject.cover = newCover;

      // delete all uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the changes
    await updateClassObject.save();

    // create result
    const result = {
      message: "Class updated successfully",
      class_data: _.pick(updateClassObject, [
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

    // send the result to user
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
