const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// English model
const English = require("../../../../models/Subjects_Banks/English/english");

// teacher model
const Teacher = require("../../../../models/Teacher/teacher");

// check editor method
const CheckEditor = require("../../../../middleware/CheckEditor");

// verify token data methoc
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// validate body data method
const Validate_delete_question = require("../../../../middleware/joi_validation/Subjects/Teacher/Joi_validate_delete_question");

// delete the image from cloudinary cloud method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_delete_question(req.body);

    // check if the body has any error
    if (Error.error) {
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

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the teacher id in token is equal id in body
    if (VerifyTokenData._id != req.body.teacher_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid teacher data ...",
            arabic: "... عذرا خطأ في بيانات المدرس",
          }),
          400
        )
      );
    }

    // find the teacher
    const teacher = await Teacher.findById(req.body.teacher_id);

    // check if the teacher is exists
    if (!teacher) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, teacher not found ...",
            arabic: "... عذرا لم يتم العثور على حساب المدرس",
          })
        ),
        404
      );
    }

    // check if the teacher is editor
    const isEditor = CheckEditor(teacher);

    if (!isEditor) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to delete question ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف السؤال",
          }),
          403
        )
      );
    }

    // find the question
    const question = await English.findById(req.body.question_id);

    // checkif the question id exists
    if (!question) {
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

    // check if the question has any image and delete it
    if (question.images.length > 0) {
      for (let i = 0; i < question.images.length; i++) {
        // delete the image from cloudinary cloud
        await DeleteCloudinary(question.images[i]);
      }
    }

    // delete the question from data base
    await English.deleteOne({_id : question._id});

    // create result
    const result = {
      message: "Question deleted successfully",
      question_data: _.pick(question, [
        "_id",
        "title",
        "description",
        "note",
        "points",
        "level",
        "images",
        "repated",
        "options",
        "created_by",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    // reeturn error
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
