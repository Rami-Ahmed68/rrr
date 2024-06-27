const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// plan model
const Plan = require("../../../models/Plan/plan");

// validate body data method
const Validate_copy_plan = require("../../../middleware/joi_validation/Teacher/Plan/Joi_validate_copy");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

router.put("/" , async (req , res , next) => {
    try {

        // validate body data 
        const Error = Validate_copy_plan(req.body);

        // checkif the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400))
        }

        // verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the teacher id in token is equal id in body
        if (VerifyTokenData._id != req.body.teacher_id) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid teacher data ...",
                arabic : "... عذرا خطأ في معلومات المدرس"
            }) , 400))
        }

        // find the teacher 
        const teacher = await Teacher.findById(req.body.teacher_id);

        // check if the teacher is exists
        if (!teacher) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, teacher not found ...",
                arabic : "... عذرا لم يتم العثور على حساب المدرس"
            }) , 404))
        }

        // find the plan
        const plan = await Plan.findById(req.body.plan_id);

        // check if the plan is eixsts
        if (!plan) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, plan not found ...",
                arabic : "... عذرا لم يتم العثور على الخطة"
            }) , 404));
        }

        // check the method type
        if (req.body.method_type == "copy") {
            // check if the teacher's plans array is has not the plan id and add the plan id to the array
            if (!teacher.my_plans.includes(plan._id)) {
                teacher.my_plans.push(plan._id)
            }

            // check if the plans's teachers array is has not the teacher id and add the teacher id to the array
            if (!plan.teachers.includes(teacher._id)) {
                plan.teachers.push(teacher._id)
            }

        } else if (req.body.method_type == "remove") {

            // remove plan ID from teacher's plans array (corrected logic)
            const teacherPlansIndex = teacher.my_plans.indexOf(plan._id);
            if (teacherPlansIndex !== -1) { // Check if plan ID exists in array
                teacher.my_plans.splice(teacherPlansIndex, 1); // Remove the plan ID
            }

            console.log(teacher.my_plans);

            // remove teacher ID from plan's teachers array (corrected logic)
            const planTeachersIndex = plan.teachers.indexOf(teacher._id);
            if (planTeachersIndex !== -1) { // Check if student ID exists in array
                plan.teachers.splice(planTeachersIndex, 1); // Remove the student ID
            }

            console.log(plan.teachers);

        }

        // save the teacher after changed
        await teacher.save();

        // save the plan after changed
        await plan.save();

        // create result
        const result = {
            "message" : req.body.method_type == "copy" ? "Plan coyed successfully" : "Plan removed successfully",
            "plan_data" : _.pick(plan , ["_id" , "title" , "description" , "note" , "plan_info" , "students" , "teachers" , "class_level" , "created_at" , "created_by"])
        }

        // send the result
        res.status(200).send(result);

    } catch (error) {
        // return error
        return next(new ApiErrors(JSON.stringify({
            english : error,
            arabic : "... عذرا خطأ عام"
        }) , 500));
    }
});

module.exports = router;