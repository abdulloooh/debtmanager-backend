const config = require("config");
module.exports = function (app, path) {
  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");

  if (!config.get("debtmanager_jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateToken key not found");
  }
};
