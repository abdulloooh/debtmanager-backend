var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { validateUser, User } = require("../models/user");

router.post("/", async (req, res, next) => {
  const { error } = validateUser(req.body); //validate
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.username }); //check if user exists
  if (user) return res.status(400).send("Username taken");

  if(req.body.username === req.body.password) return res.status(400).send("Use a more secure password");

  user = new User(req.body, _.pick(["username", "password"])); //create new user

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt); //hash password

  await user.save();

  const token = user.generateJwtToken();

  res.header("x-auth-token", token).send(_.pick(user, ["username"]));
});

module.exports = router;
