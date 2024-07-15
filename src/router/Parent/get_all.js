const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// parent model
const Parent = require("../../models/Parent/parent");

router.get("/" , async (req , res , next) => {
    try {

        // create schema 
        const Schema = Joi.object().keys({
            name : Joi.string(),
            limit : Joi.number(),
            page : Joi.number()
        });

        // validate query data
        const Error = Schema.validate(req.query);

        // check if the query data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // home page 
        const page = req.query.page || 1;

        // limit of documents
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        // create parents
        let parents;

        if (req.query.name) {
            // get all parent 
            parents = await Parent.find({ 
                name : { $regex: new RegExp(req.query.name , 'ig') }
            }).skip(skip).limit(limit).populate({
                    path : "created_by",
                    select : "_id name avatar"
                });
        } else {
            // get all parent 
            parents = await Parent.find().skip(skip).limit(limit).populate(
                {
                    path : "created_by",
                    select : "_id name avatar"
                }
            );
        }

        // create result
        const result = {
            "mesage" : "Parent geted successfully",
            "parents_data" : parents.map(parent => _.pick(parent , ["_id" , "name" , "avatar" , "gender" , "joined_at" , "children" , "created_by" , "created_at"]))
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
