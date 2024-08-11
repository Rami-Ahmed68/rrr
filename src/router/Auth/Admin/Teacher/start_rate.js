const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../../../models/Teacher/teacher");

// admin model
const Admin = require("../../../../models/Admin/admin");

// rate admin
const Rate = require("../../../../models/Rate/rate");

// validate body data method
const Validate_start_rate = require("../../../../middleware/joi_validation/Rate/Admin/start_rate");

// check admin method
const CheckAdmin = require("../../../../middleware/CheckAdmin");

// verify token method
const VerifyToken = require("../../../../utils/token_methods/VerifyToken");

router.put("/", async (req, res, next) => {
  // try {
    //validate body data
    const Error = Validate_start_rate(req.body);

    // check if the body data has any error
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
console.log(req.headers.authorization)
    // verify token data
    const VerifyTokenData = await VerifyToken(req.headers.authorization, next);

    // check if the admin id in token is equal id in body
    if (VerifyTokenData._id != req.body.admin_id) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, invalid admin data ...",
            arabic: "... عذرا خطأ في بيانات الأدمن",
          }),
          400
        )
      );
    }

    // fidn the admin
    const admin = await Admin.findById(req.body.admin_id);

    // check if the admin is exists
    if (!admin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english: "Sorry, admin not found ...",
            arabic: "... عذرا لم يتم العثور على حساب الأدمن",
          }),
          404
        )
      );
    }

    // check if the admin is admin
    const isAdmin = CheckAdmin(admin);

    //
    if (!isAdmin) {
      // return error
      return next(
        new ApiErrors(
          JSON.stringify({
            english:
              "Sorry, you do not have the permissions to start or stop the rate ...",
            arabic: "... عذرا ليس لديك الصلاحيات لبدء او إيقاف التقييم",
          }),
          403
        )
      );
    }

    // get all teachers
    const teachers = await Teacher.find();

    // check if the rate status in body is true => ( start rate )
    if (req.body.rate_status) {
      // update rate_status in teacher object
      for (let i = 0; i < teachers.length; i++) {
        teachers[i].rate_status = true;

        // save the teacher after updated
        await teachers[i].save();
      }
    } else if (!req.body.rate_status) {
      // calculate all teacher rate and delete the rate from rate collection
      for (let i = 0; i < teachers.length; i++) {
        let total_rate = 0;

        // get all teacher's rate
        const teacherRate = await Rate.find({ teacher_id: teachers[i]._id });

        // check if the teacher has any rate in rate collection
        if (teacherRate.length > 0) {
          for (let i = 0; i < teacherRate.length; i++) {
            // claculate rate
            total_rate += teacherRate[i].rate;

            // delete the rate from data base
            await Rate.deleteOne(teacherRate[i]._id);
          }

          teachers[i].list_of_rate.push({
            total_rate: total_rate,
            created_at: new Date(),
          });

          // update the teacher rate
          teachers[i].rate = total_rate / teacherRate.length;
        }

        // to stop the rate in all teacher
        for (let i = 0; i < teachers.length; i++) {
          // stope the rate status
          teachers[i].rate_status = false;

          // save the teacher
          await teachers[i].save();
        }
      }
    }

    // create result
    const result = {
      message: req.body.rate_status
        ? "Rate started successfully"
        : "Rate clacluated successfully",
    };

    // send the result
    res.status(200).send(result);
  // } catch (error) {
  //   // retun error
  //   return next(
  //     new ApiErrors(
  //       JSON.stringify({
  //         english: `${error}...`,
  //         arabic: "... عذرا خطأ عام",
  //       }),
  //       500
  //     )
  //   );
  // }
});

module.exports = router;
