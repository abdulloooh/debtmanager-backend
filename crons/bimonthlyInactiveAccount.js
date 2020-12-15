const cron = require("node-cron");
const _ = require("lodash");
const config = require("config");
const { Debt } = require("../models/debt");
const { User } = require("../models/user");
const { sendMultipleMails } = require("../models/mail");
// cron.schedule("0 9 * * *", async () => {
const todayDate = new Date(Date.now()).toDateString();
module.exports = function () {
  cron.schedule("0 8 * * *", async () => {
    //inactive users only
    const users = await User.find({
      lastAccess_plus_60days: { $lte: Date.now() },
      sixtyDaysReminderSent: false,
    });

    var debts = [];

    for (user of users) {
      let debtsPerUser = await Debt.find({ user: user._id }).populate("user", [
        "username",
        "email",
        "nextOfKin",
      ]);
      debts = debts.concat(debtsPerUser);
    }

    //arange debts by  name, email and aggregated debt list
    const orderedDebts = [];
    debts.map(async (debt) => {
      const usernameExist = orderedDebts.findIndex(
        (d) => d.username === debt.user.username
      );
      if (usernameExist === -1) {
        let newUser = {
          username: debt.user.username,
          email: debt.user.nextOfKin,
          details: new Array(formatDebt(debt)),
        };
        orderedDebts.push(newUser);
      } else {
        orderedDebts[usernameExist].details.push(formatDebt(debt));
      }
    });

    //configure email
    const mailDetails = [];
    orderedDebts.map((o) => {
      const newMailDetail = {
        mailTo: o.email,
        subject: `Due debts for ${o.username.toUpperCase()} as at ${todayDate} from Sanwo`,
        html: `
        <div>
          <strong>Hi, a Sanwo user named ${o.username.toUpperCase()}</strong> added you as their next of kin. <br/><br/>
          ${o.username.toUpperCase()} has been inactive for about 60 days now, we hope all is well with ${o.username.toUpperCase()}. <br/><br/>

          Below is the list of all ${o.username.toUpperCase()}'s due debts as at today <strong>${todayDate}</strong> <br/><br/>

          Consider informing them or helping them to pay their debts and remind those
          owing them to pay up likewise <br/><br/>

          
          <table>
          <tr>
            <td>Status</td><td>Name</td> <td>Amount</td>
          </tr>
          ${formatDebtTable(o.details)}

          </table> <br/><br/>
          <strong><em>Sanwo 💰 </em></strong>
        </div>
        `,
      };
      mailDetails.push(newMailDetail);
    });

    //send mail
    await sendMultipleMails(mailDetails);

    // update alert status to sent
    for (let user of users) {
      user.updateSixtyDaysReminderStatus(true);
      await user.save();
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  });
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

function formatDebtTable(list) {
  let message = "";
  list.map((detail) => {
    message += `<tr>
      <td>${detail.status === "dr" ? "Owed by Me" : "Owed to Me"}</td>
      <td>${detail.name}</td>
      <td>${detail.amount}</td>
    </tr>`;
  });
  return message;
}