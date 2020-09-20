const sgMail = require("@sendgrid/mail");
const config = require("config");

module.exports = async function () {
  try {
    sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

    const msg = {
      to: "abdulllooohhh@gmail.com",
      from: "abdullahakinwumi@gmail.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    await sgMail.send(msg);
  } catch (ex) {
    throw ex;
  }
};
