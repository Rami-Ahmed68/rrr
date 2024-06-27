const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv")
dotenv.config({ path : "../../../../../config/.env" });

// validate error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../../models/Admin/admin");

// teacher model
const Teacher = require("../../../../models/Teacher/teacher");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// validate body data 
const Validate_teacher_create = require("../../../../middleware/joi_validation/super_Admin/Teacher/Joi_validate_create_teacher");

// delete images method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// check supr admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// hashing password method
const HashPassword = require("../../../../utils/password_methods/HashPassword");

// upload cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// veryfi token data
const VeryfiToken = require("../../../../utils/token_methods/VerifyToken");

router.post("/" , upload , async (req , res , next) => {
    try {

        // validate body data
        const Error = Validate_teacher_create(req.body);

        // check if the body has any error
        if (Error.error) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return the error message
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // check if the request has more than i avatar
        if (req.files && req.files.length > 1) {
            // to delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return the error with error message
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, You can not upload more than one image ...",
                arabic : "... عذرا لا يمكنك ارسال اكثر من صورة شخصية"
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

        // veryfi token data
        const VeryfiTokenData = await VeryfiToken(req.headers.authorization , next);

        // check if the super admin id in body is equal id in body
        if (VeryfiTokenData._id != req.body.super_admin_id) {
            // delete all uploaded images from images folder
            DeleteImages(eq.files , next);

            // return erro
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid super admin data ..." ,
                arabic : "... عذرا خطأ في بيانات السوبر ادمن"
            }), 400));
        }

        // check if the super admin is super admin
        const isSuperAdmin = CheckSuperAdmin(superAdmin);

        if (!isSuperAdmin) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to create teacher account ..." ,
                arabic : "... عذرا ليس لديك الصلاحيات لانشاء حاسب مدرس"
            }), 403));
        }

        // find the teacher by email to check if the teacher email is already use
        const TeacherEmail = await Teacher.findOne({ email : req.body.email });

        // check if the teacher email is already used
        if (TeacherEmail) {
            // delete all uploaded images from images folder
            DeleteImages(req.files , next);

            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, the email is already use ...",
                arabic : "... عذرا الايميل مستخدم بالفعل"
            }) , 403));
        }

        // hash the password
        const HashedPassword = await HashPassword(req.body.password)

        // create the teacher
        const teacher = new Teacher({
            name : req.body.name,
            email : req.body.email,
            password : HashedPassword,
            about_me : req.body.about_me,
            gender : req.body.gender,
            editor : req.body.editor,
            subject : req.body.subject,
            created_by : req.body.super_admin_id,
            avatar : "",
            class_level : req.body.class_level
        });

        // check if the request has a avatar to upload it to cloudinary
        if (req.files && req.files.length > 0) {
            // upload the avatar to the cloudinary cloud
            const uploadedAvatar = await UploadCloudinary(req.files[0] , next);

            // set the uploaded avatar to teacher
            teacher.avatar = uploadedAvatar;

            // delete uploaded avatar
            DeleteImages(req.files , next);

        } else {
            // set the default avatr to teacher
            teacher.avatar = req.body.gender == "male" ? process.env.DEFAULT_MAN_AVATAR : process.env.DEFAULT_WOMAN_AVATAR;
        }

        // save the teacher
        await teacher.save();

        // create result
        const result = {
            "message" : "Teacher created seccussfully",
            "teacher_data" : _.pick(teacher , ["_id" , "name" , "avatar" , "editor" , "email" , "subject" , "about_me" , "gender" , "class_level"])

        }

        // send the result to user
        res.status(200).send(result);

    } catch (error) {
        // delete all uploaded images from images folder
        DeleteImages(req.files , next);

        // return the error message
        return next(new ApiErrors(JSON.stringify({
            english : error,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;