const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// admin model
const Admin = require("../../../../models/Admin/admin");

// Api Error function
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// hashing password function
const HashPassword = require("../../../../utils/password_methods/HashPassword");

// uploading image function using multer
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// delete images function
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// upload image to the cloudinary
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

// validate body data
const Validate_admin_data = require("../../../../middleware/joi_validation/super_Admin/Admin/Joi_validate_create_admin");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

router.post("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_admin_data(req.body, next);

    // check if the body data has any error
    if (Error.error) {
      // to delete uploaded avatar
      DeleteImages(req.files, next);

      // return the error
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

    // check if the request has more than i avatar
    if (req.files.length > 1) {
      // to delete all uploaded images from images folder
      DeleteImages(req.files, next);
      // return the error with error message
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, you can not upload more than one image ...",
            arabic: "... عذرا لا يمكنك ارسال اكثر من صورة شخصية",
          }),
          403
        )
      );
    }

    // find the super admin
    const superAdmin = await Admin.findById(req.body.super_admin_id);

    // check if the super admin is exists or not
    if (!superAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, super admin not found ...",
            arabic: "... عذرا لم يتم العثور عل حساب السوبر الأدمن",
          }),
          404
        )
      );
    }

    // check if the editor is super admin
    const isAdmin = CheckSuperAdmin(superAdmin);

    // check if the editor is super admin
    if (!isAdmin) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to create admin account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء حساب ادمن",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id is equal the id in token
    if (VerifyTokenData._id != req.body.super_admin_id) {
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid super admin data ...",
            arabic: "... عذرا خطأ في بيانات السوبر ادمن",
          }),
          401
        )
      );
    }

    // check and find the admin email in data base
    const oldemail = await Admin.findOne({ email: req.body.email });

    // check if the admin email is exists
    if (oldemail) {
      // to delete uploaded avatar
      DeleteImages(req.files, next);

      // return error if the email is exists
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, the email is already used ...",
            arabic: "... عذرا الايميل مستخدم بالفعل",
          }),
          403
        )
      );
    }

    // hash password
    const hashedPassword = await HashPassword(req.body.password);

    // create admin
    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender,
      is_admin: req.body.is_admin,
      phone_number: req.body.phone_number,
    });

    // chekc if the request has nay files to upload it on cloudinary
    if (req.files.length > 0) {
      // upload the avatar to cloudinary
      const newAvatar = await UploadCloudinary(req.files[0], next);

      // add the uploaded avatar url to the admin object
      admin.avatar = newAvatar;
    } else {
      // add default icon to the admin object by his gender
      admin.avatar =
        admin.gender === "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    }

    // delete the image from images folder
    DeleteImages(req.files, next);

    // save the admin in data base
    await admin.save();

    // create result
    const result = {
      message: "admin account created successfully",
      admin_data: _.pick(admin, [
        "_id",
        "name",
        "is_admin",
        "email",
        "avatar",
        "gender",
        "joinde_at",
        "rate",
      ]),
    };

    // send the result to the user
    res.status(200).send(result);
  } catch (error) {
    // to delete uploaded avatar
    DeleteImages(req.files, next);
    // return error
    return next(
      new ApiErrors(
        JSON.stringify({
          english: `${error}...`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
