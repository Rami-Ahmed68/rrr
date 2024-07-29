const mongoose = require("mongoose");

const teacher = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
  editor: {
    type: Boolean,
    default: false,
  },
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
  avatar: {
    type: String,
  },
  about_me: {
    type: String,
    required: false,
    min: 5,
    max: 500,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
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
  rate: {
    type: Number,
    default: 0,
  },
  rate_status: {
    type: Boolean,
    default: false,
  },
  list_of_rate: [
    {
      type: Object,
      properties: {
        total_rate: {
          type: Number,
          required: true,
        },
        created_at: {
          type: Date,
          required: true,
        },
      },
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
  },
  phone_number: {
    type: Number,
    min: 10,
    max: 10,
  },
  joind_at: {
    type: Date,
    default: new Date(),
  },
});

const Teacher = mongoose.model("teacher", teacher);
module.exports = Teacher;
