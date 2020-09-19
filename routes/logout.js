const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const auth = require("../middlewares/auth");

router.post("/", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  //   const token = user.generateJwtToken(1);
  res.clearCookie("access_token");
  res.send("Ok");
});

module.exports = router;
