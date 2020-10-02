const debtDailyReminder = require("./crons/debtDailyReminder");
const bimonthlyInactiveAccount = require("./crons/bimonthlyInactiveAccount");

module.exports = async function () {
  await debtDailyReminder();
  await bimonthlyInactiveAccount();
};
