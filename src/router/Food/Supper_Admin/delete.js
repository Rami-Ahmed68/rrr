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
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// veriy token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.delete("/" , async (req , res , next) => {
    try {

        // validate body data
        const Error = Validate_delete_food(req.body.require);

        // check if the data has any error 
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the super admin
        const superAdmin = await Admin.findById(req.body.super_admin_id);

        // check if the super admin is exists
        if (!superAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, super admin not found ...",
                arabic : "... عذرا لم يتم العثور على حساب السوبر ادمن"
            }) , 404));
        }

        // check if the super admin is super admin 
        const isSuperAdmin = CheckSuperAdmin(superAdmin);

        // check if the suer admin is super admin
        if (!isSuperAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to delete food meal ...",
                arabic : "... عذرا ليس لديك الصلاحيات لحذف وجبة الطعام"
            }) , 403));
        }

        // verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the super admin id in token is equal id in body
        if (VerifyTokenData._id != req.body.super_admin_id) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid super admin data ...",
                arabic : "... عذرا خطأ في بيانات السوبر ادمن"
            }) , 400));
        }

        // find the food
        const food = await Food.findById(req.body.food_id);

        // check if the food is exists
        if (!food) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, food meale not found ...",
                arabic : "... عذرا لم يتم العثور على وجبة الطعام"
            }) , 404));
        }

        // delete all food images from cloudinary cloud
        food.images.forEach( async (image) => {
            // delete image from cloudinary cloud
            await  DeleteCloudinary(image);
        });

        // delete the food from data base 
        await Food.deleteOne(food._id);

        // create result
        const result = {
            "message": "Food delete successfully",
            "food_data" : _.pick(food , ["_id" , "title" , "description" , "images"])
        };

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : error,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;