const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// class model
const ClassSchema = require("../../../models/Class/class");

// home work model
const Home_Work = require("../../../models/HomeWork/homeWork");

// delete images from cloudinary method
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// validate body data method
const Validate_hw_delete = require("../../../middleware/joi_validation/Admin/Home work/Joi_validate_delete_hw");

// verify token data 
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check admin method
const CheckAdmin = require("../../../middleware/CheckAdmin");

router.delete("/" , async (req , res , next) => {
    try {

        // validate body data
        const Error = Validate_hw_delete(req.body);

        // check if the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400))
        }

        // verify token data 
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the admin id in token is equal id in body
        if (VerifyTokenData._id != req.body.admin_id) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid admin data ...",
                arabic : "... عذرا خطأ في بيانات الادمن"
            }) , 400))
        }

        // find the admin 
        const admin = await Admin.findById(req.body.admin_id);

        // check if the admin is exists
        if (!admin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, admin not found ...",
                arabic : "... عذرا لم يتم العثور على حساب الادمن"
            }) , 404))
        }

        // check if the admin is admin
        const isAdmin = CheckAdmin(admin);

        // 
        if (!isAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to delete home work ...",
                arabic : "... عذرا ليس لديك الصلاحيات لحذف الوظيفة"
            }) , 403))
        }

        // find the home work
        const home_work = await Home_Work.findById(req.body.home_work_id);

        // check if the home work is exists
        if (!home_work) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, home work not found ...",
                arabic : "... عذرا لم يتم العثور على الوظيفة"
            }) , 404))
        }

        // find the home work's class 
        const home_work_class = await ClassSchema.findById(home_work.class_id);

        // delete the home work id from class's home works array
        home_work_class.home_works =  home_work_class.home_works.filter(Id => Id != req.body.home_work_id);

        // sav eth class after deleted the home work id 
        await home_work_class.save();

        // check and delete the home work images
        if (home_work.images.length > 0) {
            for (let i = 0; i < home_work.images.length; i++) {
                await DeleteCloudinary(home_work.images[i] , next);
            }
        }

        // delete the home work
        await Home_Work.deleteOne(home_work._id);

        // create result
        const result = {
            "message" : "Home work deleted successfully",
            "home_work_data" : _.pick(home_work , ["_id" , "title" , "description" , "note" , "class_id" , "level" , "images" , "created_at" , "created_by"])
        }

        // send result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error} ...`,
            arabic : "... عذرا خطأ عام"
        }) , 500))
    }
});

module.exports = router;
