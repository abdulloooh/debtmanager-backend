const cors = require("cors");
const config = require("config");
module.exports = function (app, path) {
  // view engine setup
  app.set("views", path.join(`${__dirname}/../`, "views"));
  app.set("view engine", "jade");

  const corsOptions = {
    // exposedHeaders: "x_auth_token",
    origin: [
      config.get("origin"),
      "https://mymoneymydebts.herokuapp.com",
      "https://wonderful-kalam-b22127.netlify.app",
    ],
    credentials: true,
  };

  app.use(cors(corsOptions));

  if (!config.get("debtmanager_jwtPrivateKey")) {
    throw new Error("FATAL ERROR: jwtPrivateToken key not found");
  }
  if (!config.get("db_conn")) {
    throw new Error("FATAL ERROR: db not configured");
  }
};
