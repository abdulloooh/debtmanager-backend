var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const config = require("config");
const mongoose = require("mongoose");
const debug = require("debug")("mymoneymydebt-backend:server");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

process.quit = () => {
  setTimeout(() => {
    process.exit(1);
  }, 300);
};

process.on("uncaughtException", (ex) => {
  //log error
  debug(ex);
  process.quit();
});

process.on("unhandledRejection", (ex) => {
  //log error
  debug(ex);
  process.quit();
});

if (!config.get("debtmanager_jwtPrivateToken")) {
  throw new Error("FATAL ERROR: jwtPrivateToken key not found");
}

mongoose
  .connect("mongodb://localhost/debtmanager", {
    reconnectTries: 5000,
    useNewUrlParser: true,
  })
  .then(() => debug("connected to mongodb successfully..."));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
