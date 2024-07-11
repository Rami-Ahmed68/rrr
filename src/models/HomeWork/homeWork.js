const mongoose = require("mongoose");

const homework = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        min : 3,
        max : 100
    },
    description : {
        type : String,
        required : true,
        min : 3,
        max : 500
    },
    class_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "class"
    },
    level : {
        type : String,
        required : true,
        enum : ["normal" , "easy" , "hard"]
    },
    subject : {
        type : String,
        required : true,
        enum : [
            "Math" 
            , "Arabic" 
            , "English" 
            , "French" 
            , "History" 
            , "Philosophy" 
            , "Physics" 
            , "Sciences" 
            , "Islam" 
            , "Geography" 
            , "Chemistry" 
            , "Alwatania"
        ]
    },
    images : [{
        type : String,
        max : 5
    }],
    note : {
        type : String,
        min : 5,
        max : 100,
        required : true
    },
    created_at : {
        type : Date,
        default : new Date()
    },
    created_by_type : {
        type : String,
        required : true,
        enum : ["admin" , "teacher"]
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        refPath : "created_by_type"
    },
});

const HomeWork = mongoose.model("homework" , homework);
module.exports = HomeWork;
