const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// history model
const History = require("../../../../models/Subjects_Banks/History/history");

// admin model
const Admin = require("../../../../models/Admin/admin");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// upload multer method
const upload_question_images = require("../../../../utils/multer/upload_question/uploadeMulter");

// delete images from images folder
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// verify token data methoc
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// upload image to cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// delete image to cloudinary method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// validate body data method
const Validate_update_question = require("../../../../middleware/joi_validation/Subjects/Super_Admin/Joi_validate_update_question");

router.put("/", upload_question_images, async (req, res, next) => {
  try {
    // validate bodt data
    const Error = Validate_update_question(req.body);

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

    // check if the request has new data
    if (
      !req.body.title &&
      !req.body.description &&
      !req.body.note &&
      !req.body.level &&
      !req.body.class_level &&
      !req.body.points &&
      !req.files &&
      req.body.images_for_delete.length == 0
    ) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "It is not permissible to request modification of data without submitting new data ...",
            arabic: "... عذرا غير مسموع بالتعديل دون ارسال بيانات جديدة",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is equal id in body
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

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists
    if (!superAdmin) {
      // delete all uploaded images from images folder
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
            english: "Sorry, you don't have permissions to update question ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل السؤال",
          }),
          403
        )
      );
    }

    // find the question
    const question = await History.findById(req.body.question_id);

    // checkif the question is exists
    if (!question) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, question not found ...",
            arabic: "... عذرا لم يتم العثور على السؤال",
          }),
          404
        )
      );
    }

    if (
      (req.files ? req.files.length : 0) +
        question.images.length -
        (req.body.images_for_delete ? req.body.images_for_delete : 0) >
      5
    ) {
      // delete all uplaoded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, can not upload more than 5 images ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من خمسة صور",
          }),
          403
        )
      );
    }

    // find and update the question
    const updateQuestion = await History.findByIdAndUpdate(
      { _id: req.body.question_id },
      {
        $set: {
          title: req.body.title ? req.body.title : question.title,
          description: req.body.description
            ? req.body.description
            : question.description,
          note: req.body.note ? req.body.note : question.note,
          points: req.body.points ? req.body.points : question.points,
          level: req.body.level ? req.body.level : question.level,
          class_level: req.body.class_level
            ? req.body.class_level
            : question.class_level,
          repated: req.body.repated ? req.body.repated : question.repated,
          options: req.body.options ? req.body.options : question.options,
          images: question.images,
        },
      },
      { new: true }
    );

    // check if the requst has any image fo delete
    if (req.body.images_for_delete && req.body.images_for_delete.length > 0) {
      for (let i = 0; i < req.body.images_for_delete.length; i++) {
        // delete the deleted image from images array
        updateQuestion.images = updateQuestion.images.filter(
          (image) => image !== req.body.images_for_delete[i]
        );

        // delete the image from cloudinary cloud
        await DeleteCloudinary(req.body.images_for_delete[i], next);
      }
    }

    // check if the requst has any images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        // upoad image to cloudinary cloud
        const uploadedImage = await UploadCloudinary(req.files[i], next);

        // add uploaded image's url to updateQuestion's images array
        updateQuestion.images.push(uploadedImage);
      }

      // delete all uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the question
    await updateQuestion.save();

    // create result
    const result = {
      message: "Question updated successfully",
      question_data: _.pick(updateQuestion, [
        "_id",
        "title",
        "description",
        "note",
        "points",
        "level",
        "images",
        "repated",
        "options",
        "true_option",
        "created_by",
      ]),
    };

    // send the result
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
