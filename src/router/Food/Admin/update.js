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
const CheckAdmin = require("../../../middleware/CheckAdmin");

router.put("/", upload_food_images, async (req, res, next) => {
  try {
    // valiadte body data
    const Error = Validate_update_food(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

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

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JOSN.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الادمن",
          }),
          400
        )
      );
    }

    // create a ImagesForDelete check if the request any images for delete
    let ImagesForDelete = req.body.images_for_delete ? JSON.parse(req.body.images_for_delete) : [];

    // check if the body images length more than 5 images
    if (req.files && req.files.length > 5) {
      // delete all uploaded images
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than five image ...",
            arabic: "... عذرا لا يمكنك ارسل اكثر من خمس صور",
          }),
          403
        )
      );
    }

    // check if the request has a new data
    if (!req.body.title && !req.body.description && req.files.length == 0) {
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

    // find the admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JOSN.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الادمن",
          }),
          404
        )
      );
    }

    // check if the admin is admin method
    const isAdmin = CheckAdmin(admin);

    // check if the is not admin
    if (!isAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to update food's meal ...",
            arabic: "... عذرا ليس لديك الصلاحيات لتعديل زجبة الطعام",
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
            english: "Sorry, food's meal not found ...",
            arabic: "... عذرا لم يتم العثور على وجبة الطعام",
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

    if (ImagesForDelete.length > 0) {
      // Create a new array to store the filtered images
      const filteredImages = food.images.filter(
        (image) => !ImagesForDelete.includes(image)
      );
    
      // Update updateFood.images with the filtered images
      updateFood.images = filteredImages;
    
      // Now, delete the images from Cloudinary
      for (let i = 0; i < ImagesForDelete.length; i++) {
        await DeleteCloudinary(ImagesForDelete[i], next);
      }
    }
    // check if the request has a new images to upload
    if (req.files && req.files.length > 0) {

      for (let i = 0; i < req.files.length; i++) {
        const uploadedImage = await UploadCloudinary(req.files[i], next);
        updateFood.images.push(uploadedImage);
      }

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
        JOSN.stringify({
          english: `${error} ...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
