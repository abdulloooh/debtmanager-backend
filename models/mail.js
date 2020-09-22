const sgMail = require("@sendgrid/mail");
const config = require("config");

async function sendMail(mailTo, subject, message) {
  sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

  const msg = {
    to: mailTo,
    from: { email: config.get("mailFrom"), name: config.get("mailName") },
    subject: subject,
    // text: text,
    html: message,
  };
  await sgMail.send(msg);
}

async function sendMultipleMails(usersDetails) {
  sgMail.setApiKey(config.get("SENDGRID_API_KEY"));
  const messages = [];
  for (let usersDetail of usersDetails) {
    messages.push({
      to: usersDetail.mailTo,
      from: { email: config.get("mailFrom"), name: config.get("mailName") },
      subject: usersDetail.subject,
      html: usersDetail.html,
    });
  }
  await sgMail.send(messages);
}

module.exports = { sendMail, sendMultipleMails };
