var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { validateUser, User } = require("../models/user");

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post("/", async (req, res, next) => {
  //validate
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if user exists
  let user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("Username taken");

  //create new user
  user = new User(req.body, _.pick(["username", "password"]));

  //hash password
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }
  //save user
  await user.save();

  //generate token and return it
  const token = user.generateJwtToken();

  res.header("x-auth-token", token).send(_.pick(user, ["_id", "username"]));
});

module.exports = router;
