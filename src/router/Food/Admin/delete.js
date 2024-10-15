const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// food model
const Food = require("../../../models/Food/food");

//validate body data method
const Validate_delete_food = require("../../../middleware/joi_validation/Food/Admin/Joi_validate_delete_food");

// delete cloudinary cloud
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// check admin method
const CheckAdmin = require("../../../middleware/CheckAdmin");

router.delete("/", async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_delete_food(req.body.require);

    // check if the data has any error
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

    // find the admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Dorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الادمن",
          }),
          404
        )
      );
    }

    // check if the admin is admin
    const isAdmin = CheckAdmin(admin);

    // check if the admin is admin
    if (!isAdmin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to delete food's meal ...",
            arabic: "... عذرا ليس لديك الصلاحيات لحذف وجبة الطعام",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
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

    // find the food
    const food = await Food.findById(req.body.food_id);

    // check if the food is exists
    if (!food) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, food male not found ...",
            arabic: "... عذرا لم يتم العثور على وجبة الطعام",
          }),
          404
        )
      );
    }

    // delete all food images from cloudinary cloud
    food.images.forEach(async (image) => {
      // delete image from cloudinary cloud
      await DeleteCloudinary(image);
    });

    // delete the food from data base
    await Food.deleteOne(food._id);

    // create result
    const result = {
      message: "Food delete successfully",
      food_data: _.pick(food, ["_id", "title", "description", "images"]),
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
