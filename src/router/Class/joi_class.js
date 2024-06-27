const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../config/.env" });

// api error method
const ApiErrors = require("../../utils/validation_error/ApiErrors");

// class model
const ClassSchema = require("../../models/Class/class");

// student modle
const Student = require("../../models/Student/student");

// valiadte body data method
const Validate_class_join_leave = require("../../middleware/joi_validation/Class/Joi_validate_join_leave_class");

// verify token data method
const VerifyToken = require("../../utils/token_methods/VerifyToken");

router.put("/" , async (req , res , next) => {
    try {

        // validate body data
        const Error = Validate_class_join_leave(req.body);

        // check if the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the student by id 
        const student = await Student.findById(req.body.student_id);

        // check if the student is exists
        if (!student) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, student not found ...",
                arabic : "... عذرا لم يتم العثور على حساب الطالب"
            }) , 404));
        }

        // verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the student id in token is equal id in body
        if (VerifyTokenData._id != req.body.student_id) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid student data ...",
                arabic : "... عذرا خطأ في بيانات الطالب"
            }), 400));
        }

        // find the class
        const classObject = await ClassSchema.findById(req.body.class_id);

        // check if the class is exists
        if (!classObject) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, class not found ...",
                arabic : "... عذرا لم يتم العثور على الصف"
            }) , 404));
        }

        // check if the student class level is equal class lvele
        if (student.class_level != classObject.class_level) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you are not at the same class level ...",
                arabic : "... عذرا انت لست من نفس مستوى الصف"
            }), 403));
        }


        // check if the student joined to class 
        if (classObject.students.includes(student._id) && student.classes.includes(classObject._id)) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you are already enrolled in this class ...",
                arabic : "... عذرا انت منضم الى الصف بالفعل"
            }) , 403));
        }

        // add student id to clss students array
        // classObject.students.push(student._id);
        classObject.students.filter(student => student != student._id);


        // add class id to student classes
        // student.classes.push(classObject._id);
        student.classes.filter(classOb => classOb != classObject._id);

        // save the student after changes
        await student.save();

        // save the class after changes
        await classObject.save();

        // create result
        const result = {
            "message" : "Joined successfully",
            "class_data" : _.pick(classObject , ["_id" , "title" , "cover" , "teacher" , "students" , "subject" , "note" , "home_works" , "class_level"])
        };

        // send result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : `${error}...`,
            arabic : ".. عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;