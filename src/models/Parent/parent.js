const mongoose = require("mongoose");

const parent = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    min: 5,
    max: 100,
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
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
    },
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  phone_number: {
    type: String,
    min: 10,
    max: 10,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Parent = mongoose.model("parent", parent);
module.exports = Parent;
