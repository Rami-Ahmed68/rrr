const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin models
const Admin = require("../../../models/Admin/admin");

// home work model
const Home_Work = require("../../../models/HomeWork/homeWork");

// class model
const ClassSchema = require("../../../models/Class/class");

// delete images method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// upload multer method
const upload_home_work_images = require("../../../utils/multer/upload_hw_images/uploadeMulter");

// upload image to cloudinary method
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// valiadte body data method
const Validate_hw_create = require("../../../middleware/joi_validation/Admin/Home work/Joi_validate_create_hw");

// check admin method
const CheckAdmin = require("../../../middleware/CheckAdmin");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.post("/", upload_home_work_images, async (req, res, next) => {
  try {
    const Error = Validate_hw_create(req.body);

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

    // check if the request has more than 5 images
    if (req.files.length > 5) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than 5 images ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من خمسة صور",
          }),
          403
        )
      );
    }

    // fidn the admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الادمن",
          }),
          404
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSOn.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الادمن",
          }),
          400
        )
      );
    }

    // check if the admin is admin
    const isAdmin = CheckAdmin(admin);

    if (!isAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to create home work ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء وظيفة",
          }),
          403
        )
      );
    }

    // fidn the class
    const Class_object = await ClassSchema.findById(req.body.class_id);

    // check if the class is exists
    if (!Class_object) {
      // delete all uploaded images
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, class not found ...",
            arabic: "... عذرا لم يتم العثور لى الصف",
          }),
          404
        )
      );
    }

    // create the home work
    const homeWork = new Home_Work({
      title: req.body.title,
      description: req.body.description,
      note: req.body.note,
      class_id: req.body.class_id,
      level: req.body.level,
      images: [],
      subject: Class_object.subject,
      created_by_type: "admin",
      created_by: req.body.admin_id,
    });

    // upload home work images
    if (req.files && req.files.length > 0) {
      // upload images to cloudinary cloud
      for (let i = 0; i < req.files.length; i++) {
        const uploadedImages = await UploadCloudinary(req.files[i], next);

        // add the uploadedImages url to home work's images array
        homeWork.images.push(uploadedImages);
      }

      // delete the uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the home work object in data base
    await homeWork.save();

    // add the created home work id to class's home works array
    Class_object.home_works.push(homeWork._id);

    // save the class object in data base after added the home work's id
    await Class_object.save();

    // create result
    const result = {
      message: "Home work created successfully",
      home_work_data: _.pick(homeWork, [
        "_id",
        "title",
        "description",
        "note",
        "class_id",
        "level",
        "images",
        "created_at",
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
