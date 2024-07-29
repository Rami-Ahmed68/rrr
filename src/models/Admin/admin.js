const mongoose = require("mongoose");

const admin = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 100,
  },
  is_supper_admin: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
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
  avatar: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  joind_at: {
    type: Date,
    default: new Date(),
  },
  phone_number: {
    type: String,
    min: 10,
    max: 10,
  },
});

const Admin = mongoose.model("admin", admin);

module.exports = Admin;
