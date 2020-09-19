const cookieParser = require("cookie-parser");
const logger = require("morgan");
const asyncError = require("../middlewares/asyncError");

const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");
const authRouter = require("../routes/auth");
const debtRouter = require("../routes/debts");
const summaryRouter = require("../routes/summary");
const logoutRouter = require("../routes/logout");

module.exports = function (express, app, path) {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(`${__dirname}/../`, "public")));

  app.use("/api", indexRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/logout", logoutRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/debts", debtRouter);
  app.use("/api/summary", summaryRouter);

  app.use(asyncError);
};
