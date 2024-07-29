const mongoose = require("mongoose");

const student = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
  birth_date: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    min: 5,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 100,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  avatar: {
    type: String,
  },
  about_me: {
    type: String,
    min: 5,
    max: 500,
  },
  finished_exams: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  total_gpa: {
    type: Number,
    default: 0,
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "class",
    },
  ],
  my_plans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
    },
  ],
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
  List_of_modifiers: [
    {
      type: Object,
      properties: {
        date: {
          type: Date,
          default: new Date(),
        },
        total_gpa: {
          type: Number,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
        finished_exams: {
          type: Number,
          required: true,
        },
      },
    },
  ],
  phone_number: {
    type: String,
    min: 10,
    max: 10,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
  },
  joind_at: {
    type: Date,
    default: new Date(),
  },
});

const Student = mongoose.model("student", student);
module.exports = Student;
