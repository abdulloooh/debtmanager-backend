const { Debt } = require("../models/debt");

module.exports = async function (req, res, next) {
  let debt = await Debt.findOne({ _id: req.params.id }); //get debt
  if (!debt) return res.status(400).send("Data not found");

  if (String(debt.user) !== req.user._id)
    return res.status(403).send("Unauthorized"); //confim id
  req.debt = debt;
  next();
};
