var express = require("express");
var router = express.Router();
const app = express();
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const { validateUser, User } = require("../models/user");
const { Debt } = require("../models/debt");
const { sendMail } = require("../models/mail");

router.get("/one", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "username email nextOfKin -_id"
  );
  res.send(user);
});

router.post("/", async (req, res, next) => {
  const { error } = validateUser(req.body); //validate
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });
  if (user)
    return res
      .status(400)
      .send(
        "User with same details already existed, try changing your username"
      );

  if (req.body.username === req.body.password)
    return res.status(400).send("Use a more secure password");

  user = new User(req.body, _.pick(["username", "email", "password"])); //create new user

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt); //hash password

  await user.save();

  const token = user.generateJwtToken();

  // res.header("x_auth_token", token).send(_.pick(user, ["username"]));
  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 432000000,
    sameSite: app.get("env") === "development" ? true : "none",
    secure: app.get("env") === "development" ? false : true,
  });
  res.send(_.pick(user, ["username"]));
});

router.put("/", auth, async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(255),
    nextOfKin: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(406).send(error.details[0].message);

  let user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });
  if (user) {
    //ok, but is the user trying to update same as that found
    //if not: it means someone trying to use existing details and not his
    if (String(user._id) !== req.user._id)
      return res
        .status(406)
        .send(
          "User with same details already existed, try changing your username"
        );
  }

  user = await User.findById(req.user._id); //check if userID exist
  if (!user) return res.status(400).send("Invalid user");

  // if (req.body.username === req.body.password)
  //   return res.status(406).send("Use a more secure password");

  // const salt = await bcrypt.genSalt(10);
  // user.password = await bcrypt.hash(req.body.password, salt); //hash password

  user.username = req.body.username;
  user.email = req.body.email;
  user.nextOfKin = req.body.nextOfKin;

  await user.save();

  const token = user.generateJwtToken();

  // res.header("x_auth_token", token).send(_.pick(user, ["username"]));
  res
    .cookie("access_token", token, {
      httpOnly: true,
      sameSite: app.get("env") === "development" ? true : "none",
      secure: app.get("env") === "development" ? false : true,
    })
    .send(_.pick(user, ["username"]));
});

router.delete("/", auth, async (req, res, next) => {
  let user = true;
  while (user) {
    user = await User.findByIdAndRemove(req.user._id);
  }

  let debt = true;

  while (debt) {
    debt = await Debt.findOneAndRemove({ user: req.user._id });
  }

  res.clearCookie("access_token");
  res.sendStatus(200);
  res.end();
});

router.post("/nextofkin", auth, async (req, res) => {
  const schema = Joi.object({
    nextOfKin: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(406).send(error.details[0].message);

  let user = await User.findById(req.user._id);
  if (!user) return res.status(401).send("Invalid user");

  user.nextOfKin = req.body.nextOfKin;
  await user.save();

  res.sendStatus(200);
});

router.post("/forgetpassword", async (req, res) => {
  const data = { ...req.body };

  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(data);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: data.email, username: data.username });
  if (user) {
    user.generatePasswordReset();
    await user.save();

    const link =
      req.get("origin") + "/password-reset/" + user.resetPasswordToken;
    const message = `
    <div>
      <strong>Hi ${user.username}</strong> <br/><br/> 
      Please click on the this <a target="_blank" href="${link}">link</a> link to reset your password. <br/>
      If you did not request this, please ignore this email and your password will remain unchanged.<br/><br/>
      <br/>
      <strong><em>Sanwo 💰 </em></strong>
    </div>`;
    await sendMail(user.email, "Sanwo Password Reset", message);
  }
  //if not: all the best, pretend as if you have sent it to his email
  //that is just for security purpose, do not let him know the email does not exist
  res.sendStatus(200);
});

router.post("/passwordreset", async (req, res) => {
  /**
   * Expecting: new password and reset token
   * Validate password
   * Search for user with that reset token and ensure it has not expired
   * Change password
   * Respond success
   */
  const data = { ...req.body };

  const schema = Joi.object({
    password: Joi.string().min(3).max(255).required(),
    resetPasswordToken: Joi.string().min(1).max(255).required(),
  });

  const { error } = schema.validate(data);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    resetPasswordToken: data.resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(401).send("Invalid or expired token");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(data.password, salt); //hash password

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  const message = `
  <div>
    <strong>Hi ${user.username}</strong> <br/><br/> 
    Your password has been changed succesfully. <br/>
    Kindly reply to this mail if you need further assistance. <br/><br/>

    <strong><i>Sanwo 💰 </i></strong>
  </div>`;
  await sendMail(user.email, "Password Reset Successful", message);

  res.sendStatus(200);
});

module.exports = router;
