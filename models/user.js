const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 50,
    lowercase: true,
    required: true,
  },
  email: { type: String, lowercase: true },
  password: { type: String, minlength: 7, maxlength: 255 },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.methods.generateJwtToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username },
    config.get("debtmanager_jwtPrivateKey"),
    { expiresIn: "5 days" }
  );
};

userSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 900000; //expires in 15 minutes
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = {
  validateUser,
  User,
};
