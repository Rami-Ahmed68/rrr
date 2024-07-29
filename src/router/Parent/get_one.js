const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// parent model
const Parent = require("../../models/Parent/parent");

router.get("/", async (req, res, next) => {
  try {
    // craete Schema to validate params data
    const Schema = Joi.object().keys({
      parent_id: Joi.string().required(),
    });

    // validate params data
    const Error = Schema.validate(req.query);

    // check if the params dtahas any error
    if (Error.error) {
      // reurnreturn error
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

    // find parent
    const parent = await Parent.findById(req.query.parent_id).populate([
      {
        path: "created_by",
        select: "_id name avatar",
      },
      {
        path: "children",
        select: "_id name avatar",
      },
    ]);

    // check if the parent is exists
    if (!parent) {
      // return error
      return next(new ApiErrors("Invalid parent not found ...", 404));
    }

    // craete result
    const result = {
      message: "Parent geted successfuly",
      // { user data } ot save all users data in one profile objectin vue.js's store
      user_data: _.pick(parent, [
        "_id",
        "name",
        "avatar",
        "gender",
        "childern",
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
          english: `${error}`,
          arabic: "... عذرا خطأ عام",
        }),
        500
      )
    );
  }
});

module.exports = router;
