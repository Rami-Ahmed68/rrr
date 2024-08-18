const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../../../config/.env" });

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// student model
const Student = require("../../../../models/Student/student");

// admin model
const Admin = require("../../../../models/Admin/admin");

// parent model
const Parent = require("../../../../models/Parent/parent");

// hashing password function
const HashPassword = require("../../../../utils/password_methods/HashPassword");

// validate body data method
const Validate_parent_create = require("../../../../middleware/joi_validation/super_Admin/Parent/Joi_validate_create_parent");

// upload avatar method
const upload = require("../../../../utils/multer/upload_avatar/uploadeMulter");

// delete uploaded images method
const DeleteImages = require("../../../../utils/multer/DeleteImages");

// check super admin method
const CheckSuperAdmin = require("../../../../middleware/CheckSuperAdmin");

// verify token data method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

// uploading cloudinary method
const UploadCloudinary = require("../../../../utils/cloudinary/UploadCloudinary");

router.post("/", upload, async (req, res, next) => {
  try {
    // validate body data
    const Error = Validate_parent_create(req.body);

    // check if the body data has any error
    if (Error.error) {
      // delete all uploaded images from images folder
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
    if (req.files && req.files.length > 1) {
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

    // check if the super admin is exists
    if (!superAdmin) {
      // delete all uploaded images from images folder
      DeleteImages(req.files, next);

      // return the error
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

    // check if the super admin is super admin
    const isSuperAdmin = CheckSuperAdmin(superAdmin);

    if (!isSuperAdmin) {
      // delete all uploaded iamges from images folder
      DeleteImages(req.files, next);

      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you don't have permissions to create parent account ...",
            arabic: "... عذرا ليس لديك الصلاحيات لإنشاء حساب ولي امر",
          }),
          403
        )
      );
    }

    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the super admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.super_admin_id) {
      // delete all uploaded iamges from images folder
      DeleteImages(req.files, next);

      // return the error
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

    // find the parent by email to check it if the email is exists
    const ParentEmail = await Parent.findOne({ email: req.body.email });

    // check if the email is exists
    if (ParentEmail) {
      // delete all uploaded iamges from images folder
      DeleteImages(req.files, next);

      // return the error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, the email is already use ...",
            arabic: "... عذرا الايميل مستخدم بالفعل",
          }),
          403
        )
      );
    }

    // hash password
    const hashedPassword = await HashPassword(req.body.password);

    // create parent account
    const parent = new Parent({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      gender: req.body.gender,
      created_by: req.body.super_admin_id,
      phone_number: req.body.phone_number,
    });

    // check if the request any image upload it to cloudinary
    if (req.files && req.files.length > 0) {
      // upload the new avatar to cloudinary
      const uploadedAvatar = await UploadCloudinary(req.files[0], next);

      // set the uploaded avatar to parent account
      parent.avatar = uploadedAvatar;

      // delete the uploaded image from images folder
      DeleteImages(req.files, next);
    } else {
      // set the default avatar
      parent.avatar =
        req.body.gender === "male"
          ? process.env.DEFAULT_MAN_AVATAR
          : process.env.DEFAULT_WOMAN_AVATAR;
    }

    // create a new array for children
    let childrenArray = JSON.parse(req.body.children) || [];

    // check if the children array length is more than one children id
    if (childrenArray && childrenArray.length > 0) {
      for (let i = 0; i < childrenArray.length; i++) {
        // get the children
        const student = await Student.findById(childrenArray[i]);

        // check if the student is exists
        if (!student) {
          // delete all uploaded images
          DeleteImages(req.files, next);

          // return error
          return next(
            new ApiErrors(
              JSON.stringify({
                english: "Sorry, invalid student's id ...",
                arabic: "... عذرا خطأ في معرفات الطلاب",
              }),
              400
            )
          );
        } else {
          // add the student id to the parent's children array
          parent.children.push(student._id);
        }
      }
    }

    // save the parent in data base
    await parent.save();

    // create result
    const result = {
      message: "Parent account created successfuly",
      parent_data: _.pick(parent, [
        "_id",
        "avatar",
        "email",
        "gender",
        "children",
      ]),
    };

    // send the result to user
    res.status(200).send(result);
  } catch (error) {
    // delete all uploaded images from images folder
    DeleteImages(req.files, next);

    // return the error
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
