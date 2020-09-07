const express = require("express");
const path = require("path");

const winston = require("winston");
const debug = require("debug")("mymoneymydebt-backend:server");
const app = express();

require("./startup/prod")(app);
require("./startup/errorHandler")(debug, winston);
require("./startup/config")(app, path);
require("./startup/db")(debug);
require("./startup/routes")(express, app, path);
require("./startup/doc")(app);

module.exports = app;
