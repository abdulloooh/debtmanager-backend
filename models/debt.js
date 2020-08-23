const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 50, required: true },
  description: { type: String, maxlength: 255 },
  amount: { type: Number, min: 1, max: 100000000000, required: true },
  dateIncurred: { type: Date, default: Date.now, maxlength: 255 },
  dateDue: { type: Date, maxlength: 255 },
  status: { type: String, minlength: 2, maxlength: 2, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Debt = mongoose.model("Debt", debtSchema);

function validateDebt(debt) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(255),
    amount: Joi.number().min(1).max(100000000000).required(),
    dateIncurred: Joi.date(),
    dateDue: Joi.date(),
    status: Joi.string().min(2).max(2).required(),
  });
}

module.exports = { Debt, validateDebt };
