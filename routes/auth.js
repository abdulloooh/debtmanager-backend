const express = require("express");
const router = express.Router();
const app = express();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");

router.post("/", async (req, res, next) => {
  const { error } = validateUser(req.body); //validate
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.username }); //check if user exists
  if (!user) return res.status(400).send("Invalid Username or Password");

  //check if password matches if password exists
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Invalid Username or Password");

  const token = user.generateJwtToken();

  res
    .cookie("x-auth-token", token, {
      httpOnly: true,
      secure: app.get("env") === "development" ? false : true,
    })
    .send(_.pick(user, ["username"]));
});

module.exports = router;
