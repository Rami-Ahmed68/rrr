const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// message model
const Message = require("../../models/Message/message");

router.get("/" , async (req , res , next) => {
    try {

        // create Schema to validate body data
        const Schema = Joi.object().keys({
            recipient : Joi.string()
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

        // create all messages
        let messages;

        // check if the query has a recipient
        if (req.query.recipient) {
            messages = await Message.find({
                $or: [
                        { recipient: req.query.recipient },
                        { recipient: "public" },
                    ],
            }).populate({
                path : "created_by",
                select : "_id name avatar"
            }).sort({ _id : -1 });
        } else {
            messages = await Message.find()
            .populate({
                path : "created_by",
                select : "_id name avatar"
            }).sort({ _id : -1 });
        }

        // create result
        const result = {
            "message" : "Message geted successfully",
            "messages_data" : messages.map(message => _.pick(message , ["_id" , "title" , "description" , "note" , "recipient" , "level" , "created_by" , "created_at"])) 
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