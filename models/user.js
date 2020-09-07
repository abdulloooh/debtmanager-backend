const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  username: { type: String, minlength: 3, maxlength: 50, required: true },
  password: { type: String, minlength: 7, maxlength: 255, required: true },
});

userSchema.methods.generateJwtToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username },
    config.get("debtmanager_jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(user);
}

module.exports = {
  validateUser,
  User,
};
