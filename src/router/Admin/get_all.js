const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../models/Admin/admin");

router.get("/" , async (req , res , next) => {
    try {

        // create schema to validate query data
        const Schema = Joi.object().keys({
            name : Joi.string(),
            limit : Joi.number(),
            page : Joi.number()
        });

        // validate query data
        const Error = Schema.validate(req.query);

        // check if the query data has ahy error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // home page
        const page =  1 || req.query.page;

        // limit of the documents
        const limit =  5 || req.query.limit;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        let admins;

        if (req.query.name) {
            // get admins
            admins = await Admin.find({
                name : { $regex: new RegExp(req.query.name, 'ig') }
            }).skip(skip).limit(limit).sort({ _id : -1 });
        } else {
            // get admins
            admins = await Admin.find().skip(skip).limit(limit).sort({ _id : -1 });
        }

        // create resul
        const result = {
            "message" : "Admins geted successfully",
            "admins_data" : admins.map(admin => _.pick(admin , ["_id" , "name" , "avatar" , "is_supper_admin" , "is_admin" , "email" , "gender" , "rate" , "joind_at"]))
        };

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;
