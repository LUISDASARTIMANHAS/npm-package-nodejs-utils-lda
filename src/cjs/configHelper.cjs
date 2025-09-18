// configHelper.cjs
const fs = require("fs");
const { fwrite } = require("./autoFileSysModule.cjs");

function configExist() {
  if (!fs.existsSync("config.json")) {
    fwrite("config.json", {});
  }
}

module.exports = { configExist };
