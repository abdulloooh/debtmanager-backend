const sgMail = require("@sendgrid/mail");
const config = require("config");

module.exports = async function (mailTo, subject, message) {
  try {
    sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

    const msg = {
      to: mailTo,
      from: config.get("mailFrom"),
      subject: subject,
      // text: text,
      html: message,
    };
    await sgMail.send(msg);
  } catch (ex) {
    throw ex;
  }
};
