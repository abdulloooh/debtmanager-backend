const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const _ = require("lodash");

const debtSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 50, required: true },
  description: { type: String, maxlength: 255 },
  amount: { type: Number, min: 1, max: 100000000000, required: true },
  dateIncurred: {
    type: Date,
    default: Date.now,
    maxlength: 255,
    min: "2000-01-01",
    max: "3000-01-01",
  },
  dateDue: { type: Date, maxlength: 255, min: "2000-01-01", max: "3000-01-01" },
  status: { type: String, minlength: 2, maxlength: 2, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", lowercase: true },
});

const Debt = mongoose.model("Debt", debtSchema);

function validateDebt(debt) {
  let temp = { ...debt }; //to remove _id if the calling process is updating an exisiting data
  delete temp._id;
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(255),
    amount: Joi.number().min(1).max(100000000000).required(),
    dateIncurred: Joi.date(),
    dateDue: Joi.date(),
    status: Joi.string().min(2).max(2).required(),
  });

  return schema.validate(temp);
}

function formatReturningData(data) {
  return {
    ..._.pick(data, ["name", "description", "amount", "status"]),
    dateIncurred: new Date(data.dateIncurred).toDateString(),
    dateDue: data.dateDue && new Date(data.dateDue).toDateString(),
  };
}

module.exports = { Debt, validateDebt, formatReturningData };
