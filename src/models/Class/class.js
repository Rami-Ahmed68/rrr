const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
  ],
  subject: {
    type: String,
    required: true,
    enum: [
      "Math",
      "Arabic",
      "English",
      "French",
      "History",
      "Philosophy",
      "Physics",
      "Sciences",
      "Islam",
      "Geography",
      "Chemistry",
      "Alwatania",
    ],
  },
  note: {
    type: String,
    min: 3,
    max: 500,
  },
  home_works: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "homework",
    },
  ],
  cover: {
    type: String,
  },
  created_by_type: {
    type: String,
    required: true,
    enum: ["admin", "teacher"],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "created_by_type",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "teacher",
  },
  class_level: {
    type: String,
    required: true,
    enum: [
      "First_grade",
      "Second_grade",
      "Third_grade",
      "Fourth_grade",
      "Fifth_grade",
      "Sixth_grade",
      "Seventh_grade",
      "Eighth_grade",
      "Ninth_grade",
      "Literary_Tenth_grade",
      "Scientific_Tenth_grade",
      "Literary_Eleventh_grade",
      "Scientific_Eleventh_grade",
      "Literary_baccalaureate",
      "Scientific_baccalaureate",
    ],
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const ClassSchema = mongoose.model("class", classSchema);

module.exports = ClassSchema;
