const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// message model
const Message = require("../../../models/Message/message");

// validate body data method
const Validate_update_message = require("../../../middleware/joi_validation/Message/Super_Admin/Joi_validate_update_message");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");


router.put("/" , async (req , res , next) => {
    try {

        // validate body data 
        const Error = Validate_update_message(req.body);

        // check if the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JOSN.stringify({
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

        // fidn the message
        const message = await Message.findById(req.body.message_id).populate({
            path : "created_by",
            select : "_id name avatar"
        });

        // chekc if the messaeg is eixsts
        if (!message) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, message not found ...",
                arabic : "... عذرا لم يتم العثور على الرسالة"
            }) , 404));
        }

        // fidn and update the message
        const updateMessage = await Message.findByIdAndUpdate({ _id : req.body.message_id } , {
            $set : {
                title : req.body.title ? req.body.title : message.title,
                description : req.body.description ? req.body.description : message.description,
                note : req.body.note ? req.body.note : message.note,
                recipient : req.body.recipient ? req.body.recipient : message.recipient,
                level : req.body.level ? req.body.level : message.level,
            }
        } , { new : true }).populate({
            pasth : "created_by",
            select : "_id name avatar"
        });

        // save the message in data base after changes
        await updateMessage.save();

        // create result
        const result = {
            "message" : "Message updated successfully",
            "message_data" : _.pick(updateMessage , ["_id" , "title" , "description" , "note" , "recipient" , "level" , "created_by" , "created_at"])
        };

        // send the result to user
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