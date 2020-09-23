const express = require("express");
const path = require("path");

const winston = require("winston");
const debug = require("debug")("mymoneymydebt-backend:server");
const app = express();

require("@knuckleswtf/scribe-express")(app);
require("./startup/prod")(app);
require("./startup/errorHandler")(debug, winston);
require("./startup/config")(app, path);
require("./startup/db")(debug);
require("./startup/routes")(express, app, path);

module.exports = app;
