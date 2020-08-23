const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const _ = require("lodash");
const { Debt, validateDebt } = require("../models/debt");

router.get("/", auth, async (req, res) => {
  const debts = await Debt.find({ user: req.user._id })
    .select("-__v -user")
    .populate("user", "username")
    .sort("dateDue")
    .skip(0)
    .limit(200);

  res.send(debts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateDebt(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const debt = new Debt(
    _.pick(req.body, [
      "name",
      "description",
      "amount",
      "dateIncurred",
      "dateDue",
      "status",
    ])
  );
  debt.user = req.user._id;

  await debt.save();

  res.send({
    ..._.pick(debt, ["name", "description", "amount", "status"]),
    dateIncurred: new Date(debt.dateIncurred).toDateString(),
    dateDue: new Date(debt.dateDue).toDateString(),
  });
});

module.exports = router;
