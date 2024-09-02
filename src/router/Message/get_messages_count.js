const express = require("express");
const router = express.Router();
const Joi = require("joi");


// Message model
const Message = require("../../models/Message/message");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // create a Schema to validate query data
    const Schema = Joi.object().keys({
      recipient : Joi.string().required()
    });

    // validate the query data
    const Error = Schema.validate(req.query);

    // check if the query has any error
    if (Error.error) {
      // return error
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

    // create a message's count var
    let MessageCount = 0 ;

    if (req.query.recipient == "super" || req.query.recipient == "admin") {
      // get to the all Message count 
      MessageCount = await Message.countDocuments({ });
    } else if (req.query.recipient == "teachers") {
      // get to the all Message count 
      MessageCount = await Message.countDocuments({ $or : [
        { recipient : "teachers" },
        { recipient : "public" }
      ] });
    } else if (req.query.recipient == "students") {
      // get to the all Message count 
      MessageCount = await Message.countDocuments({ $or : [
        { recipient : "students" },
        { recipient : "public" }
      ] });
    } else if (req.query.recipient == "parents") {
      // get to the all Message count 
      MessageCount = await Message.countDocuments({ $or : [
        { recipient : "parents" },
        { recipient : "public" }
      ] });
    }

    // console.log(MessageCount)

  // create a result
  const results = {
    "message" : "Geted to all Message length",
    "Messages_count" : MessageCount
  }

  // sed the response
  res.status(200).send(results);

  } catch (error) {
      // return error
      return next(new ApiErrors(JSON.stringify({
          english : `${error} ...`,
          arabic : "... عذرا خطأ عام"
        }),
        500
      )
    )
  }
});

module.exports = router;