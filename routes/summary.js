const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { Debt, calculateTotal } = require("../models/debt");
const debtSummary = require("../models/summary");

router.get("/", auth, async (req, res) => {
  let debts = await Debt.find({ user: req.user._id });
  debts = calculateTotal(debts);
  res.send(debtSummary(debts));
});

module.exports = router;
