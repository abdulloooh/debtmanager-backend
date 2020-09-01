const express = require("express");
const path = require("path");

const winston = require("winston");
const debug = require("debug")("mymoneymydebt-backend:server");
const app = express();

require("./startup/errorHandler")(debug, winston);
require("./startup/db")(debug);
require("./startup/routes")(express, app, path);
require("./startup/config")(app, path);
require("./startup/prod")(app);

module.exports = app;
