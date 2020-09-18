const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.cookies.x_auth_token;
  if (!token) return res.status(401).send("Please log in again"); //Access denied
  try {
    req.user = jwt.verify(token, config.get("debtmanager_jwtPrivateKey"));
    next();
  } catch (ex) {
    let errMessage = "";
    if (ex.message === "jwt expired") errMessage = "Please log in again";
    return res.status(400).send(errMessage || "Invalid request");
  }
};
