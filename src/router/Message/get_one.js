const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// message model
const Message = require("../../models/Message/message");

router.get("/", async (req, res, next) => {
  try {
    const Schema = Joi.object().keys({
      message_id: Joi.string().required(),
    });

    // validate query data
    const Error = Schema.validate(req.query);

    // check if the query data has any error
    if (Error.error) {
      // return error
      return next(
        new ApiErrors({
          english: Error.error.details[0].message,
          arabic: "... عذرا خطأ في البيانات المرسلة",
        }),
        400
      );
    }

    // find the message
    const message = await Message.findById(req.query.message_id).populate({
      path: "created_by",
      select: "_id name avatar",
    });

    // check if the message is eixsts
    if (!message) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, message not found ...",
            arabic: "... عذرا لم يتم العثور على الرسالة",
          })
        ),
        404
      );
    }

    // create result
    const result = {
      message: "Message geted successfully",
      message_data: _.pick(updateMessage, [
        "_id",
        "title",
        "description",
        "note",
        "recipient",
        "level",
        "created_by",
        "created_at",
      ]),
    };

    // send the result
    res.status(200).send(result);
  } catch (error) {
    // return error
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
