const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// home work model
const Home_Work = require("../../../models/HomeWork/homeWork");

// validate body data method
const Validate_hw_update = require("../../../middleware/joi_validation/Admin/Home work/Joi_validate_update_hw");

// upload multer method
const upload_home_work_images = require("../../../utils/multer/upload_hw_images/uploadeMulter");

// check admin method
const CheckAdmin = require("../../../middleware/CheckAdmin");

// delete images from images folder method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// uploade cloudinary method
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// delete cloudinary method
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// verify token datamethod
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.put("/", upload_home_work_images, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_hw_update(req.body);

    // check if the body has any error
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
      !req.body.files &&
      !req.body.images_for_delete
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

    // check if the requesat has more thean 5 images
    if (req.files && req.files.length > 5) {
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

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الادمن",
          }),
          400
        )
      );
    }

    // findthe admin
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

    // check if the admin is admin
    const isAdmin = CheckAdmin(admin);

    //
    if (!isAdmin) {
      // delete al uploadedimages from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update home work ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل الوظيفة",
          }),
          403
        )
      );
    }

    // find the home work
    const home_work = await Home_Work.findById(req.body.home_work_id);

    // check if the home work is exists
    if (!home_work) {
      // delete al uploadedimages from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, home work not found ...",
            arabic: "... عذرا لم يتم العثور على الوظيفة",
          }),
          403
        )
      );
    }

    // create imagesForDelete
    const ImagesForDelete = req.body.images_for_delete ? JSON.parse(req.body.images_for_delete) : [];

    // check if the images count is less than 5 images
    if (
      (req.files ? req.files.length : 0) +
        home_work.images.length -
        (ImagesForDelete ? ImagesForDelete : 0) >
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

    // find and update the home work
    const updateHomeWork = await Home_Work.findByIdAndUpdate(
      { _id: req.body.home_work_id },
      {
        $set: {
          title: req.body.title ? req.body.title : home_work.title,
          description: req.body.description
            ? req.body.description
            : home_work.description,
          note: req.body.note ? req.body.note : home_work.note,
          level: req.body.level ? req.body.level : home_work.level,
          images: home_work.images,
        },
      },
      { new: true }
    );

    // check if the request has a images to delete
    if (ImagesForDelete && ImagesForDelete.length > 0) {
      for (let i = 0; i < ImagesForDelete.length; i++) {
        // filter and return images url
        updateHomeWork.images = updateHomeWork.images.filter(
          (image) => image != ImagesForDelete[i]
        );

        // delete the image from cloudinary
        await DeleteCloudinary(ImagesForDelete[i]);
      }
    }

    // check if the request has a new images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        // uploadethe image to cloudinary cloud
        const uploadedImgae = await UploadCloudinary(req.files[i], next);

        // add the uploaded to home work's images array
        updateHomeWork.images.push(uploadedImgae);
      }

      // delete all uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the home work after changed
    await updateHomeWork.save();

    // create result
    const result = {
      message: "Home work updated successfully",
      home_work_data: _.pick(updateHomeWork, [
        "_id",
        "title",
        "description",
        "note",
        "level",
        "images",
        "created_by",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
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
