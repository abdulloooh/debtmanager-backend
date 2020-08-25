module.exports = function (debug) {
  process.quit = () => {
    setTimeout(() => {
      process.exit(1);
    }, 300);
  };

  process.on("uncaughtException", (ex) => {
    //log error
    debug(ex.message);
    process.quit();
  });

  process.on("unhandledRejection", (ex) => {
    //log error
    debug(ex.message);
    process.quit();
  });
};
