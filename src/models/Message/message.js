const mongoose = require("mongoose");

const message = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        min : 5,
        max : 50
    },
    description : {
        type : String,
        required : true,
        min : 5,
        max : 500
    },
    note : {
        type : String,
        min : 5,
        max : 100
    },
    recipient : {
        type : String,
        enum : ["students" , "parents" , "teachers" , "public"],
        required : true
    },
    level : {
        type : String,
        required : true,
        enum : ["normal" , "important" , "veryimportant"]
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "admin"
    },
    created_at : {
        type : Date,
        default : new Date()
    }
});

const Message = mongoose.model("message" , message);
module.exports = Message;