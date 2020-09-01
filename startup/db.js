const mongoose = require("mongoose");
const config = require("config");
module.exports = function (debug) {
  mongoose
    .connect(config.get("db_conn"), {
      reconnectTries: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => debug("connected to mongodb successfully..."));
};
