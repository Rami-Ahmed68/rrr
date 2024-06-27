const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// math model
const Math = require("../../../../models/Subjects_Banks/Math/math");

// admin model
const Admin = require("../../../../models/Admin/admin");

// validate body data method
const Validate_create_question = require("../../../../middleware/joi_validation/Subjects/Admin/Joi_validate_create_question");

// upload multer method
const upload_question_images = require("../../../../utils/multer/upload_question/uploadeMulter");

// delete images from images folder method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// check admin method
const CheckAdmin = require("../../../../middleware/CheckAdmin");

// verify token data methoc
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// upload image to cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

router.post("/" , upload_question_images , async (req , res , next) => {
    try {

        // validate body data 
        const Error = Validate_create_question(req.body);

        // check if the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // check if the request has more than 5 images
        if (req.files && req.files.length > 5) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you can not upload more than 5 images ...",
                arabic : "... عذرا لا يمكنك ارسال اكثر من خمسة صور"
            }) , 403))
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
            }) , 400));
        }

        // find the admin
        const admin = await Admin.findById(req.body.admin_id);

        // check if the admin is exists
        if (!admin) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, admin not found ...",
                arabic : "... عذرا لم يتم العثور على حساب الادمن"
            }) , 404));
        }

        // check if the admin is admin
        const isAdmin = CheckAdmin(admin);

        if (!isAdmin) {
            // delete all uploadedimages from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to create question ...",
                arabic : "... عذرا ليس لديك الصلاحيات لإنشاء السؤال"
            }) , 403));
        }

        // create the question
        const question = new Math({
            title : req.body.title,
            description : req.body.description,
            note : req.body.note ? req.body.note : "",
            points : req.body.points,
            level : req.body.level,
            class_level : req.body.class_level,
            repated : req.body.repated,
            options : req.body.options,
            images : [],
            created_by_type : "admin",
            created_by : req.body.admin_id
        });

        // check if the request has any images 
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.body.files.length; i++) {
                // upload the image to cloudinary cloud
                const uploadedImage = await UploadCloudinary(req.body.files[i]);

                // add the uploaded image to question's array
                question.images.push(uploadedImage);
            }

            // delete all uploaded image from images folder
            DeleteImages(req.files , next);
        }

        // sav ethe question in data base
        await question.save();

        // create result
        const result = {
            "message" : "Question created successfully",
            "question_data" : _.pick(question , ["_id" , "title" , "description" , "note" , "points" , "level" , "images" , "repated" , "options" , "created_by"])
        };

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return netx(new ApiErrors(JSON.stringify({
            english : `${error}...`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;