const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// food model
const Food = require("../../../models/Food/food");

// validate body data
const Validate_update_food = require("../../../middleware/joi_validation/Food/Admin/Joi_validate_update_food");

// delete images method
const DeleteImages = require("../../../utils/multer/DeleteImages");

// upload food images multer method
const upload_food_images = require("../../../utils/multer/upload_food_images/uploadeMulter");

// delete cloudinary cloud
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// uplad cloudinary
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// veriy token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

router.put("/", upload_food_images, async (req, res, next) => {
  try {
    // valiadte body data
    const Error = Validate_update_food(req.body);

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

    // verifytoken data
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

    // craete the new images for delete
    let ImagesForDelete;

    // check if the request any images for delete
    if (req.body.images_for_delete) {
      ImagesForDelete = JSON.parse(req.body.images_for_delete)
    }

    // check if the body images length more than 5 images
    if (req.files && req.files.length > 5) {
      // delete all uploaded images
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, You can not upload more than five image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من خمسة صور",
          }),
          403
        )
      );
    }

    // check if the request has a new data
    if (!req.body.title &&
      !req.body.description &&
      !req.body.images_for_delete &&
      req.files.length == 0) {
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
    const isAdmin = CheckSuperAdmin(superAdmin);

    // check if the is not super admin
    if (!isAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update food meal ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل وجبةالطعام",
          }),
          403
        )
      );
    }

    // find the food
    const food = await Food.findById(req.body.food_id);

    // check if the food is exists
    if (!food) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, food meal not found ...",
            arabic: "... عذرا لم يتم العثور على زجبة الطعام",
          }),
          404
        )
      );
    }

    // find and update the food
    const updateFood = await Food.findByIdAndUpdate(
      { _id: req.body.food_id },
      {
        $set: {
          title: req.body.title ? req.body.title : food.title,
          description: req.body.description
            ? req.body.description
            : food.description,
          images: food.images,
        },
      },
      { new: true }
    );

    // check if the request has images's index to delete
    if (ImagesForDelete && ImagesForDelete.length > 0) {
      // chdck if the food image length is equal one or not
      if (food.images.length == 1) {
        // delete all uploaded images from images folder
        DeleteImages(req.files, next);

        // return error
        return next(
          new ApiErrors(
            JSON.stringify({
              english: "Sorry, you cannot delete all food images ...",
              arabic: "... عذرا لا يمكنك حذف جميع صور وجبة الطعام",
            }),
            403
          )
        );
      } else {
        ImagesForDelete.forEach(async (image) => {
          updateFood.images = food.images.filter((img) => img != image);
          await DeleteCloudinary(image, next);
        });
      }
    }

    // check if the request has a new images to upload
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadedImage = await UploadCloudinary(req.files[i], next);
        updateFood.images.push(uploadedImage);
      }
      console.log(updateFood);

      // delete all uploaded images from images folder
      DeleteImages(req.files, next);
    }

    // save the changes
    await updateFood.save();

    // create resul
    const result = {
      message: "Food updated successfully",
      food_data: _.pick(updateFood, ["_id", "title", "description", "images"]),
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
