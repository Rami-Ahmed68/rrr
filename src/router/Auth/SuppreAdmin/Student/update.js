const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../../../config/.env" });

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../../models/Admin/admin");

// student model
const Student = require("../../../../models/Student/student");

// veryfi token data
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// delete all images method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// valiadte body data method
const Validate_student_update = require("../../../../middleware/joi_validation/super_Admin/Student/Joi_validate_update_student");

// delete the avatar from cloudinary method
const DeleteCloudinary = require("../../../../utils/cloudinary/DeleteCloudinary");

// hashing password method
const HashinPassword = require("../../../../utils/password_methods/HashPassword");

// upload avatar to cloudinry cloud method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");


router.put("/" , upload , async (req , res , next) => {
    try {
        // valiadte body data
        const Error = Validate_student_update(req.body);

        // check if the body data has any error
        if (Error.error) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return the error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // check if the body has new data
        if (!req.body.name && !req.body.password
            && !req.body.gender && !req.body.class_level
            && !req.body.birth_date && req.body.about_me
            && !req.body.delete_avatar
            && !req.body.phone_number
            && req.files.length == 0
            ) {
                // delete all uploaded images from images folder
                DeleteImages(req.files , next);

            // return error If the body does not have any data
            return next(new ApiErrors(JSON.stringify({
                english : "It is not permissible to request modification of data without submitting new data ...",
                arabic : "... عذرا غير مسموح بالتعديل دونارسال بيانات جديدة"
            }) , 403));
        }

        // check if the request has more than i avatar
        if (req.files.length > 1) {
            // to delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return the error with error message
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you can not upload more than one image ...",
                arabic : "... عذرا لا يمكنك ارسال اكثر من صورة شخصية واحدة"
            }) , 403));
        }

        // find the super admin
        const superAdmin = await Admin.findById(req.body.super_admin_id);

        // check if the super admin is exists
        if (!superAdmin) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, super admin not found ...",
                arabic : "... عذرا لم يتم العثور على حساب السوبر ادمن"
            }) , 404));
        }

        // check if the super admin is super admin
        const isSuperAdmin = CheckSuperAdmin(superAdmin);

        if (!isSuperAdmin) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to update student account ...",
                arabic : "... عذراليس لديك صلاحيات لتعديل حساب الطالب"
            }) , 403));
        }

        // verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the super admin id in token is eqaul the id in body
        if (VerifyTokenData._id != req.body.super_admin_id) {
                // delete all uploaded images from images folder
                DeleteImages(req.files , next);

                // return error
                return next(new ApiErrors(JSON.stringify({
                    english : "Sorry, invalid super admin data ..." ,
                    arabic : "... عذرا خطأ في بيانات السوبر ادمن"
                }), 400));
        }

        // find student 
        const student = await Student.findById(req.body.student_id);

        // check if the student is exists
        if (!student) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, student not found ...",
                arabic : "... عذرا لم يتم العثور على حساب الطالب"
            }) , 404));
        }

        // find and update the student 
        const updateStudent = await Student.findByIdAndUpdate({ _id : req.body.student_id } , {
            $set : {
                name : req.body.name ? req.body.name : student.name,
                birth_date : req.body.birth_date ? req.body.birth_date : student.birth_date,
                password : req.body.password ?  await HashinPassword(req.body.password) : student.password,
                gender : req.body.gender ? req.body.gender : student.gender,
                about_me : req.body.about_me ? req.body.about_me : student.about_me,
                class_level : req.body.class_level ? req.body.class_level : student.class_level,
                phone_number : req.body.phone_number ? req.body.phone_number : student.phone_number
            }
        } , { new : true })


        // check if the 
        if (req.body.delete_avatar) {
            // check if the request has any image and delete it
            if (req.files && req.files.length > 0) {
                DeleteImages(req.files , next);
            }

            // check if the old avatar is not a default avatar
            if (student.avatar != process.env.DEFAULT_WOMAN_AVATAR && student.avatar != process.env.DEFAULT_MAN_AVATAR) {
                // delete the old avatar from cloudinary
                await DeleteCloudinary(student.avatar , next);
            }

            // set the default avatar
            updateStudent.avatar = 
            updateStudent.gender == "male" 
            ? process.env.DEFAULT_MAN_AVATAR 
            : process.env.DEFAULT_WOMAN_AVATAR 


        } else {
            // check if the request has not any new avatar
            if (req.files.length == 0) {
                return next(new ApiErrors(JSON.stringify({
                    english : "Sorry, You must send a new avatar ...",
                    arabic : "... عذرا يجب ارسال صورة شخصية جديدة"
                }) , 403));
            }

            // upload the new avatar
            const newAvatar = await UploadCloudinary(req.files[0] , next);

            //set the new avatar
            updateStudent.avatar = newAvatar;

            // check if the old avatar is not a default avatar
            if (student.avatar != process.env.DEFAULT_WOMAN_AVATAR && student.avatar != process.env.DEFAULT_MAN_AVATAR) {
                // delete the old avatar from cloudinary
                await DeleteCloudinary(student.avatar , next);
            }

            // delete the uploaded images from images folder
            DeleteImages(req.files, next);
        }

        // save the changes
        await updateStudent.save();

        // create result 
        const result = {
            "message" : "Student account updated successfully",
            "student_data" : _.pick(updateStudent , ["_id" , "name" , "birth_date" , "avatar" , "email" , "gender" , "about_me" , "class_level"])
        }

        // send the result to use
        res.status(200).send(result);

    } catch (error) {
        // delete all uploaded images
        DeleteImages(req.files , next);

        // return the error
        return next(new ApiErrors(JSON.stringify({
            english : error,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;