const express = require("express");
const router = express.Router();
const _ = require("lodash");

// api error method 
const ApiErrors = require("../../../utils/validation_error/ApiErrors");

// admin model
const Admin = require("../../../models/Admin/admin");

// teacher model
const Teacher = require("../../../models/Teacher/teacher");

// student model
const Student = require("../../../models/Student/student");

// plan model
const Plan = require("../../../models/Plan/plan");

// verify token data method
const VerifyToken = require("../../../utils/token_methods/VerifyToken");

// check super admin method
const CheckSuperAdmin = require("../../../middleware/CheckSuperAdmin");

// validate body data method
const Validate_plan_delete = require("../../../middleware/joi_validation/super_Admin/Plan/Joi_validate_delete_plan");

router.delete("/" , async (req , res , next) => {
    try {

        // validate body data 
        const Error = Validate_plan_delete(req.body);

        // check if the body data has any error
        if (Error.error) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : Error.error.details[0].message,
                arabic : "... عذرا خطأ في البيانات المرسلة"
            }) , 400));
        }

        // find the super admin
        const superAdmin = await Admin.findById(req.body.super_admin_id);

        // check if the super admin is exists
        if (!superAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, super admin not found ...",
                arabic : "... عذرا لم يتم العثور على حساب السوبر ادمن"
            }) , 404));
        }

        //verify token data
        const VerifyTokenData = await VerifyToken(req.headers.authorization , next);

        // check if the super admin id in token is equal id in body 
        if (VerifyTokenData._id != req.body.super_admin_id) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, invalid super admin data ...",
                arabic : "... عذرا خطأ في بيانات السوبر ادمن"
            }) , 400))
        }

        // check if the super admin is super admin
        const isSuperAdmin = CheckSuperAdmin(superAdmin);

        if (!isSuperAdmin) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, you don't have permissions to delete plan ...",
                arabic : "... عذرا ليس لديك الصلاحيات لحذف الخطة"
            }) , 403));
        }

        // find the plan
        const plan = await Plan.findById(req.body.plan_id);

        // check if the plan is exists
        if (!plan) {
            // return error
            return next(new ApiErrors(JSON.stringify({
                english : "Sorry, plan not found ...",
                arabic : "... عذرا لم يتم العثور على الخطة"
            }) , 404));
        }

        // check if the plan's teachers array length is more than one 
        if (plan.teachers.length > 0) {
            for (let i = 0; i < plan.teachers.length; i++) {
                // find the teacher 
                const teacher = await Teacher.findById(plan.teachers[i]);

                if (teacher) {
                    teacher.my_plans = teacher.my_plans.filter(plan_id => plan_id != plan._id);
                }

                // save the teacher after changed
                await teacher.save();
            }
        }

        // check if the plan's student's array length is more than one
        if (plan.students.length > 0) {
            for (let i = 0; i < plan.students.length; i++) {
                // fidn the student
                const student = await Student.findById(plan.students[i]);

                // check if the 
                if (student) {
                    student.plans = student.plans.filter(plan_id => plan_id != plan._id);
                }

                // save the student afetr changed
                await student.save();
            }
        }

        // delete the plan
        await Plan.deleteOne(plan._id);

        // creatre result
        const result = {
            "message" : "Plan created successfully",
            "plan_data" : _.pick(plan , ["_id" , "title" , "description" , "note" , "teachers" , "students" , "created_by"])
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