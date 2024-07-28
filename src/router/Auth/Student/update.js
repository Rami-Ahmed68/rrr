const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../../config/.env" });

// student model
const Student = require("../../../models/Student/student");

// Api Error function
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// uploading image function using multer
const upload = require("../../../utils/multer/upload_avatar/uploadeMulter");

// delete images function
const DeleteImages = require("../../../utils/multer/DeleteImages");

// hashing password method
const HashPassword = require("../../../utils/password_methods/HashPassword");

// upload image to the cloudinary
const UploadCloudinary = require("../../../utils/cloudinary/UploadCloudinary");

// delete avatar from cloudinary cloud method
const DeleteCloudinary = require("../../../utils/cloudinary/DeleteCloudinary");

// verify token data
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// validate body data method
const Validate_student_update = require("../../../middleware/joi_validation/Student/Joi_validate_update");

router.put("/" , upload , async (req , res , next) => {

    try {

        res.send(req.files)
        
        // check if the request has more than i avatar
        if (req.files && req.files.length > 1) {
            // to delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return the error with error message
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you can not upload more than one image ...",
                arabic : "... عذرا لا يمكنك ارسال اكثر من صورة شخصية"
            }) , 403));
        } 

        // validte body data
        const Error = Validate_student_update(req.body , next);

        // check if the body data has any error
        if (Error.error) {
            // to delete uploaded avatar
            DeleteImages(req.files , next);

            // return the error message
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // check if the request has any data
        if (!req.body.name && !req.body.gender && !req.body.password && !req.body.delete_avatar && !req.body.phone_number && req.files.length == 0) {
            // to delete uploaded avatar
            DeleteImages(req.files , next);

        // return error If the body does not have any data
            return next(new ApiErrors(JSON.stringify({
                english : "It is not permissible to request modification of data without submitting new data ...",
                arabic : "... عذرا غير مسموح بالتعديل دون ارسال بيانات جديدة"
            }) , 403));
        }

        // verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // verify token id with student id in body 
        if (VerifyTokenData._id != req.body.student_id) {
            // to delete uploaded avatar
            DeleteImages(req.files , next);

            // return error with failed message
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid student data ...",
                arabic : "... عذرا خطأ في بيانات الطالب"
            }) , 400))
        }

        // find the student by id
        const student = await Student.findById(req.body.student_id);

        // check if the student is exists
        if (!student) {
            // to delete uploaded avatar
            DeleteImages(req.files , next);

            // return error if the student is not exists
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, student not found ...",
                arabic : "... عذرا لم يتم العثور على حساب الطالب"
            }) , 404));
        }

        // update student acount and return the student data after updated 
        const updateStudent = await Student.findByIdAndUpdate({ _id : req.body.student_id } , {
            $set : {
                name : req.body.name ? req.body.name : student.name,
                password : req.body.password ? await HashPassword(req.body.password) : student.password,
                about_me : req.body.about_me ? req.body.about_me : student.about_me,
                phone_number : req.body.phone_number ? req.body.phone_number : student.phone_number
            }
        } , { new : true });


        if (req.body.delete_avatar == true) {
            if (req.files && req.files.length > 0) {
                // delete the uploaded images from images folder
                DeleteImages(req.files , next);
            }

            // check if the old avatar is not default avatar
            if (student.avatar != process.env.DEFAULT_WOMAN_AVATAR && student.avatar != process.env.DEFAULT_MAN_AVATAR) {
                // delete old avatar 
                await DeleteCloudinary(student.avatar , next);
            }

            // set default avatar 
            updateStudent.avatar = updateStudent.gender == "male" ? process.env.DEFAULT_MAN_AVATAR : process.env.DEFAULT_WOMAN_AVATAR

        } else if (req.body.delete_avatar == false){

            // check if the request has any image
            if (req.files && req.files.length == 0) {
                // return error if the request hasn't new avatar
                return next(new ApiErrors(JSON.stringify({
                    english : "Sorry, you must send a new avatar ...",
                    arabic : "... عذرا يجب ارسال صورة شخصية جديدة"
                }) , 403));
            }

            if (student.avatar != process.env.DEFAULT_WOMAN_AVATAR && student.avatar != process.env.DEFAULT_MAN_AVATAR) {
                // delete old avatar
                await DeleteCloudinary(student.avatar , next);
            }

            // upload new avatar to cloudinary
            const newAvatar = await UploadCloudinary(req.files[0] , next);

            // update the student avatar 
            updateStudent.avatar = newAvatar;

            // delete the avatar
            DeleteImages(req.files , next);
        }

        // save the student 
        await updateStudent.save();

        // delete avatar from images folder
        DeleteImages(req.files , next);

        // create result
        const result = {
            "message" : "Acount data updated successfully",
            "user_data" : _.pick(updateStudent , ["_id" , "name" , "avatar" , "email" , "about_me" , "phone_number" , "gender" , "finished_exams" , "points" , "classes" , "my_plans" , "class_level" , "joind_at"]),
        }

        // send the data to user
        res.status(200).send(result)

    } catch (error) {
        // to delete uploaded avatar
        DeleteImages(req.files , next);

        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error} ...`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;
