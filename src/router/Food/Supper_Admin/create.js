const express = require("express");
const router = express.Router();
const _ = require("lodash");

// admin model
const Admin = require("../../../models/Admin/admin");

// food model
const Food = require("../../../models/Food/food");

// api error
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// delete images method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// validate body data
const Validate_create_food = require("../../../middleware/joi_validation/Food/Super_Admin/Joi_validate_create_food");

// check admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// upload food images multer method
const upload_food_images = require("../../../utils/multer/upload_food_images/uploadeMulter");

// uplad cloudinary
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// veriy token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.post("/", upload_food_images, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_create_food(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete all uplaoded images from images folder
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

    // check if the body hasn't images return error
    if (req.files.length == 0) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you must add at least one image ...",
            arabic: "... عذرا يجب ارسال صورة واحدة على الاقل",
          }),
          403
        )
      );
    }

    // check if the body images length more than 5 images
    if (req.files.length > 5) {
      // delete all uploaded images
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than five image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من خمسة صور",
          }),
          403
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

    // check if the super admin is super admin method
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    // check if the super admin is super admin
    if (!isSuperAdmin) {
      // delete all uplaoded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to create food meal ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء وجبة طعام",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // delete all uplaoded images from images folder
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

    // find the food by name
    const foodTitle = await Food.findOne({ title: req.body.title });

    // check if the foodTitle is exists
    if (foodTitle) {
      // delete all uplaoded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, the food's title is alrady use ...",
            arabic: "... عذرا عنوان وجبة الطعام مستخدم بالفعل",
          }),
          403
        )
      );
    }

    // craete food
    const food = new Food({
      title: req.body.title,
      description: req.body.description,
      created_by: req.body.super_admin_id,
      images: [],
    });

    // upload the images to cloudinary
    for (let i = 0; i < req.files.length; i++) {
      // upload the image to cloudinary cloud
      const uploadedImage = await UploadCloudinary(req.files[i], next);

      // add the uploaded image url to food's images array
      food.images.push(uploadedImage);
    }

    // delete all uploaded image from images folder
    DeleteImages(req.files, next);

    // save the food in data base
    await food.save();

    // create result
    const result = {
      message: "Food created successfully",
      food_data: _.pick(food, [
        "_id",
        "title",
        "description",
        "images",
        "created_by",
      ]),
    };

    // send result
    res.status(200).send(result);
  } catch (error) {
    // delete all uplaodedimages
    DeleteImages(req.files, next);

    // return error
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
