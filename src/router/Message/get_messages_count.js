const express = require("express");
const router = express.Router();
const _ = require("lodash");


// messages model
const Messages = require("../../models/Message/message");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

router.get("/" , async (req , res , next) => {
  try {

    // create a Schema to validate body data
    const Schema = Joi.object().keys({
      recipient : Joi.string().required()
    });

    // validate the body data
    const Error = Schema.validate(req.body);

    // check if the body has any error
    if (Error.error) {
      // return the error
      return next(new ApiErrors(
        JSON.stringify({
          english : Error.error.details[0].messages,
          arabic : "... عذرا خطأ في البيانات المرسلة"
        })
      ))
    }

    // create a message's count var
    let MessagesCount ;

    if (req.body.recipient == "super" || req.body.recipient == "admin") {
      // get to the all messages count 
      MessagesCount = await Messages.countDocuments({ });
    } else if (req.body.recipient == "teachers") {
      // get to the all messages count 
      MessagesCount = await Messages.countDocuments({ $or : [
        { recipient : "teachers" },
        { recipient : "public" }
      ] });
    } else if (req.body.recipient == "students") {
      // get to the all messages count 
      MessagesCount = await Messages.countDocuments({ $or : [
        { recipient : "students" },
        { recipient : "public" }
      ] });
    } else if (req.body.recipient == "parents") {
      // get to the all messages count 
      MessagesCount = await Messages.countDocuments({ $or : [
        { recipient : "parents" },
        { recipient : "public" }
      ] });
    }

  console.log(MessagesCount);

  // create a result
  const results = {
    "message" : "Geted to all messages length",
    "messages_length" : MessagesCount
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