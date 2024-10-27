const express = require("express");
const router = express.Router();

// api error method
const ApiErrors = require("../utils/validation_error/ApiErrors");

// message model
const Message = require("../models/Message/message");

const AutoDeleteMessages = async () => {
  try {

    // using the moment-timezone libbery
    const now = moment().tz('Asia/Damascus').toDate();

    // notification old
    const duration = new Date(now - 24 * 60 * 60 * 1000);

    // find messages that were created more than 24 hours ago
    const messages = await Message.find({
      created_at: { $lt: duration },
    });

    // delete all geted messages from data base
    messages.forEach(async (message) => {
      await Message.deleteOne(message._id);
    });
  } catch (error) {
    return new ApiErrors(
      JSON.stringify({
        english: `${error} ...`,
        arabic: "... عذرا خطأ عام",
      }),
      500
    );
  }
};

module.exports = AutoDeleteMessages;
