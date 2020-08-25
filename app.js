const express = require("express");
const path = require("path");

const debug = require("debug")("mymoneymydebt-backend:server");
const app = express();

require("./startup/errorHandling")(debug);
require("./startup/db")(debug);
require("./startup/routes")(express, app, path);
require("./startup/config")(app, path);

module.exports = app;