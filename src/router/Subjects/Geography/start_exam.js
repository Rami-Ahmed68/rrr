const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

//api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// geography model
const Geography = require("../../../models/Subjects Banks/Geography/geography");


router.get("/" , async (req , res , next) => {
    try {

        // create Schema
        const Schema = Joi.object().keys({
            class_level : Joi.string().required()
        });

        // validate query data
        const Error = Schema.validate(req.query);

        // check if the query data has any error
        if (Error.error) {
            // return error
            return enxt(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // number of questions
        const numQuestions = 30;

        // geted question
        const randomQuestions = await Geography.aggregate([
          { $match: { class_level: req.query.class_level } }, // Filter by class level
          { $sample: { size: numQuestions } }, // Sample randomly from the filtered collection
        ]);

        // create result
        const result = {
            "message" : "Questions geted successfully",
            "questions_data" : randomQuestions.map(question => _.pick(question , ["_id" , "title" , "description" , "note" , "points" , "level" , "images" , "repated" , "options"]))
        }

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}...`,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;