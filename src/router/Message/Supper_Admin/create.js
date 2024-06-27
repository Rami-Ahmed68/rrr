const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// student model
const Student = require("../../../models/Student/student");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// parent model
const Parent = require("../../../models/Parent/parent");

// message model 
const Message = require("../../../models/Message/message");

// validate body data method
const Validate_create_message = require("../../../middleware/joi_validation/Message/Super_Admin/Joi_validate_create_message");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

router.post("/" , async (req , res , next) => {
    try {

        // validate body data
        const Error = Validate_create_message(req.body);

        // check if the body data has any error
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
            }) , 400))
        }

        // verify token data 
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // chec if the super admin id in token is equal id in body
        if (VerifyTokenData._id != req.body.super_admin_id) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid super admin data ...",
                arabic : "... عذرا خطأ في بيانات السوبر ادمن"
            }) , 400));
        }

        // check if the super admin is super admin
        const isSuperAdmin = CheckSuperAdmin(superAdmin);

        if (!isSuperAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to create message ...",
                arabic : "... عذرا ليس لديك الصلاحيات لإنشاء رسالة"
            }) , 403))
        }

        // create message
        const message = new Message({
            title : req.body.title,
            description : req.body.description,
            note : req.body.note,
            recipient : req.body.recipient,
            level : req.body.level,
            created_by : req.body.super_admin_id,
        });

        // save th message in data base 
        await message.save();

        // create result
        const result = {
            "message" : "Message created successfully",
            "message_data" : _.pick(message , ["_id" , "title" , "description" , "note" , "recipient" , "level" , "created_by" , "created_at"])
        }

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}`,
            arabic : "... عذرا خطأ عام"
        }) , 500))
    }
});

module.exports = router;