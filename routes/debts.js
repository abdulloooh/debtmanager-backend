const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const _ = require("lodash");
const { Debt, validateDebt, formatReturningData } = require("../models/debt");

router.get("/", auth, async (req, res) => {
  const debts = await Debt.find({ user: req.user._id })
    .select("-__v -user")
    .populate("user", "username")
    .sort("dateDue")
    .skip(0)
    .limit(500);

  let formattedDebts = [];
  debts.forEach((debt) => {
    let clone = { ...debt._doc };
    if (clone.dateIncurred)
      clone.dateIncurred = new Date(debt.dateIncurred).toDateString();
    if (clone.dateDue) clone.dateDue = new Date(debt.dateDue).toDateString();
    formattedDebts.push(clone);
  });

  res.send(formattedDebts);
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

  res.send(formatReturningData(debt));
});

router.put("/:id", auth, async (req, res) => {
  const debt = await Debt.findOne({ _id: req.params.id }); //get debt
  if (!debt) return res.status(400).send("Data not found");

  if (String(debt.user) !== req.user._id)
    return res.status(403).send("Unauthorized"); //confim id

  const { error } = validateDebt(req.body); //Joi validation
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, amount, dateIncurred, dateDue, status } = req.body;
  debt.name = name;
  debt.description = description;
  debt.amount = amount;
  debt.dateIncurred = dateIncurred;
  if (dateDue) debt.dateDue = dateDue;
  debt.status = status;

  await debt.save();

  res.send(formatReturningData(debt));
});

module.exports = router;
