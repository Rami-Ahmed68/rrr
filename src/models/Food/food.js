const mongoose = require("mongoose");

const food = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
  description: {
    type: String,
    required: true,
    min: 3,
    max: 500,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Food = mongoose.model("food", food);

module.exports = Food;
