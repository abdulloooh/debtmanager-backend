const cron = require("node-cron");
const _ = require("lodash");
const { Debt } = require("./models/debt");

module.exports = function () {
  // cron.schedule("0 10 * * *", async () => {
  cron.schedule("* * * * *", async () => {
    const debts = await Debt.find({
      dateDue: { $lte: Date.now() },
    }).populate("user", ["username", "email"]);
    const orderedDebts = [];
    debts.map((debt) => {
      const usernameExist = orderedDebts.findIndex(
        (d) => d.username === debt.user.username
      );
      if (usernameExist === -1) {
        let newUser = {
          username: debt.user.username,
          email: debt.user.email,
          details: new Array(formatDebt(debt)),
        };
        orderedDebts.push(newUser);
      } else {
        orderedDebts[usernameExist].details.push(formatDebt(debt));
      }
    });
    // console.log(orderedDebts[0].details, orderedDebts[1].details);
  });
  //scheduling email
  //format message
};
function formatDebt(debt) {
  return _.pick(debt, [
    "_id",
    "name",
    "amount",
    "dateIncurred",
    "dateDue",
    "status",
  ]);
}
