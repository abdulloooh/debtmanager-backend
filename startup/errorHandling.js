require("express-async-errors");
require("winston-mongodb");

module.exports = function (debug, winston) {
  winston.configure({
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log", level: "info" }),
      new winston.transports.MongoDB({
        db: "mongodb://localhost/debtmanager",
        level: "warn",
      }),
    ],
  });

  if (process.env.NODE_ENV !== "production")
    winston.add(
      new winston.transports.Console({ colorize: true, prettyPrint: true })
    );

  process.quit = () => {
    setTimeout(() => {
      process.exit(1);
    }, 300);
  };

  process.on("uncaughtException", (ex) => {
    debug(ex.message);
    winston.error(ex.message, ex);
    process.quit();
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
