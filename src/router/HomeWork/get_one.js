const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// home work model
const Home_Work = require("../../models/HomeWork/homeWork");

router.get("/" , async (req , res , next) => {
    try {

        // create Schema to validate body data
        const Schema = Joi.object().keys({
            home_work_id : Joi.string().required()
        });

        // validate query data
        const Error = Schema.validate(req.query);

        // check if the query has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the home work by id
        const home_work = await Home_Work.findById(req.query.home_work_id).populate([
            {
                path : "class_id",
                select : "_id title cover"
            },
            {
                path : "created_by",
                select : "_id name avatar"
            }
        ]);

        // check if the home work is exists
        if (!home_work) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, home work not found ...",
                arabic : "... عذرا لم يتم العثور على الوظيفة"
            }) , 404));
        }

        // create result
        const result = {
            "message" : "Home work geted successfully",
            "home_work_data" : _.pick(home_work , ["_id" , "title" , "description" , "note" , "level" , "class_id" , "subject" , "images" , "created_by" , "created_by_type" , "created_at"])
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
