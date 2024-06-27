const mongoose = require("mongoose");

const rate = new mongoose.Schema({
    teacher_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "teacher"
    },
    student_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "student"
    },
    rate : {
        type : Number,
        required : true
    },
    created_at : {
        type : Date,
        default : new Date()
    }
});

const Rate = mongoose.model("rate" , rate);
module.exports = Rate;