const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../config/.env" });

// admin model
const Admin = require("../../../models/Admin/admin");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// student model
const Student = require("../../../models/Student/student");

// home work model
const Home_Work = require("../../../models/HomeWork/homeWork");

// class model
const Class = require("../../../models/Class/class");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// validatebody data method
const Validate_class_delete = require("../../../middleware/joi_validation/Teacher/Class/Joi_validate_delete_class");

// check super admin
const CheckEditor = require("../../../middleware/CheckEditor");

// delete imagefrom cloudinary cloud method
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

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
];

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_class_delete(req.body);

    // check if the body data has any error
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
          }),
          404
        )
      );
    }

    // check if the teacher is editor
    const isEditor = CheckEditor(teacher);

    if (!isEditor) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you don't have permissions to delete class ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف الصف",
          }),
          403
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

    // find the class
    const classObject = await Class.findById(req.body.class_id);

    // check if the class is eixsts
    if (!classObject) {
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

    // check if the class cover is not default cover and delete it
    if (!Default_covers.includes(classObject.cover)) {
      await DeleteCloudinary(classObject.cover ,next);
    }

    // delete the class id from all class's students
    classObject.students.forEach(async (student_id) => {
      // get the student
      const getStudent = await Student.findById(student_id);

      // delete the class id from student classes
      getStudent.classes.filter((class_id) => class_id != req.body.class_id);

      // save the student
      await getStudent.save();
    });

    // find the class teacher todelete the class id from teacher class's
    const classTeacher = await Teacher.findById(classObject.teacher._id);

    if (classTeacher) {
      // delete the class id from teacher class's
      classTeacher.classes = classTeacher.classes.filter(
        (class_id) => class_id != req.body.class_id
      );
    }

    // save the class teacher
    await classTeacher.save();

    // check if the class has any home work and delete it
    if (classObject.home_works.length > 0) {
      classObject.home_works.forEach(async (hw_id) => {
        // find the home work by id
        const home_work = await Home_Work.findById(hw_id);

        // check if the home work has any image
        if (home_work.images.length > 0) {
          for (let i = 0; i < home_work.images.length; i++) {
            // delete the images from cloudinary cloud
            await DeleteCloudinary(home_work.images[i] , next);
          }
        }

        // delete the home work
        await Home_Work.deleteOne(home_work._id);
      });
    }

    // and delete the class
    await Class.deleteOne(classObject._id);

    // craete result
    const result = {
      message: "Class deleted successfully",
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

    // send the result to use
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
