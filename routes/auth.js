const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");

router.post("/", async (req, res, next) => {
  //validate
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if user exists
  let user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("Invalid Username or Password");

  //check if password matches if password exists
  if (user.password) {
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid Username or Password");
  }

  //generate token and return it
  const token = user.generateJwtToken();

  res.header("x-auth-token", token).send(_.pick(user, ["_id", "username"]));
});

module.exports = router;
