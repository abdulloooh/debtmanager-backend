const cron = require("node-cron");
const _ = require("lodash");
const config = require("config");
const { Debt } = require("./models/debt");
const { sendMultipleMails } = require("./models/mail");

const todayDate = new Date(Date.now()).toDateString();
module.exports = function () {
  cron.schedule("0 10 * * *", async () => {
    const debts = await Debt.find({
      dateDue: { $lte: Date.now() },
    }).populate("user", ["username", "email"]);

    //arange debts by  name, email and aggregated debt list
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

    //configure email
    const mailDetails = [];
    orderedDebts.map((o) => {
      const newMailDetail = {
        mailTo: o.email,
        subject: `Your Due Debts as at ${todayDate} - from Sanwo`,
        html: `
        <div>
          Hi ${o.username.toUpperCase()}, <br/><br/>
          Below is the list of all your due debts as at today ${todayDate}, 
          consider checking them out to pay your own debts and remind those 
          owing you to pay up likewise. Mark them complete by simply deleting 
          them using the links provided below. <br/><br/>
          
          <table>
          <tr>
            <td>Status</td><td>Name</td> <td>Amount</td> <td>Link</td>
          </tr>
          ${formatDebtTable(o.details)}
            
          </table> <br/><br/>
          Best regards, <br/> Abdullah from Sanwo
        </div>
        `,
      };
      mailDetails.push(newMailDetail);
    });

    //send mail
    await sendMultipleMails(mailDetails);
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
      <td><a href="${
        config.get("origin") + "/debts/" + detail._id
      }"><i>visit</i></a></td>
    </tr>`;
  });
  return message;
}
