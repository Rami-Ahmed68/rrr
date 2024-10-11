const mongoose = require("mongoose");

const physics = new mongoose.Schema({
  
  title: {
    type: String,
    required: true,
    min: 3,
  },
  description: {
    type: String,
    required: true,
    min: 3,
  },
  note: {
    type: String,
    required: true,
    min: 5,
  },
  points: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    enum: ["easy", "normal", "hard"],
    required: true,
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
  images: [
    {
      type: String,
      max: 5,
    },
  ],
  repated: [
    {
      type: String,
    },
  ],
  options: [
    {
      type: Object,
      required: true,
      properties: {
        value: {
          type: String,
          required: true,
        },
        answer: {
          type: Boolean,
          required: true,
        },
      },
    },
  ],
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
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Physics = mongoose.model("physics", physics);
module.exports = Physics;
