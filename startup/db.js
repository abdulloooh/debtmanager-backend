const mongoose = require("mongoose");
module.exports = function (debug) {
  mongoose
    .connect("mongodb://localhost/debtmanager", {
      reconnectTries: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => debug("connected to mongodb successfully..."));
};
