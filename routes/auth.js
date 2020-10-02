const express = require("express");
const router = express.Router();
const app = express();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const { User, validateUser } = require("../models/user");
const auth = require("../middlewares/auth");
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

  // res.header("x_auth_token", token).send(_.pick(user, ["username"]));
  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 432000000,
      // domain: "",
      sameSite: app.get("env") === "development" ? true : "none",
      secure: app.get("env") === "development" ? false : true,
    })
    .send({
      ..._.pick(user, ["username"]),
      nextOfKin: user.nextOfKin ? true : false,
    });
});

router.put("/password", auth, async (req, res) => {
  const schema = Joi.object({
    old_password: Joi.string().min(3).max(255).required(),
    new_password: Joi.string().min(3).max(255).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(406).send(error.details[0].message);

  let user = await User.findById(req.user._id); //check if user exists
  if (!user) return res.status(400).send("Invalid user");

  //check if password matches if password exists
  const validPassword = await bcrypt.compare(
    req.body.old_password,
    user.password
  );
  if (!validPassword) return res.status(406).send("Old Password incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.new_password, salt); //hash password

  await user.save();

  res.clearCookie("access_token").sendStatus(200);
});

module.exports = router;
