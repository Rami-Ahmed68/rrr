const mongoose = require("mongoose");

const plan = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 5,
  },
  description: {
    type: String,
    required: true,
    min: 5,
  },
  note: {
    type: String,
    min: 5,
  },
  plan_info: [
    {
      type: Object,
      day: {
        type: String,
        min: 3,
      },
      date: {
        type: String,
      },
      subjects: [
        {
          subject: {
            type: String,
            min: 3,
            required: true,
          },
          start_time: {
            type: String,
            required: true,
          },
          end_time: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
  ],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
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

const Plan = mongoose.model("plan", plan);
module.exports = Plan;
