const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const _ = require("lodash");
const { Debt, validateDebt } = require("../middlewares/auth");

router.get("/", auth, async (req, res, next) => {
  const { error } = validateDebt(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const debts = Debt.find({ user: req.user._id })
    .populate("user", "username")
    .skip(0)
    .take(200);

  res.send(debts);
});

module.exports = router;
