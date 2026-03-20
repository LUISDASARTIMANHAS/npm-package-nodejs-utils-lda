// configHelper.cjs
const fs = require("fs");
const { fwrite } = require("./autoFileSysModule.cjs");

function configExist() {
  if (!fs.existsSync("config.json")) {
    console.warn("\n[configExist] creating config...\n");
    fwrite("config.json", {});
  }
}
configExist();

function getConfig() {
  configExist();
  const config = fopen("config.json");
  console.log("\n[configExist] load config!\n");
  return config;
}

function saveConfig(data) {
  const config = fwrite("config.json", data);
  console.log("\n[configExist] save config!\n");
  return config;
}

function checkConfigValue(key, value) {
  // obtem config.json
  const configs = getConfig();
  // verifica se existe a config
  if (!configs[key]) {
    // caso não exista configura
    configs[key] = value;
    // salva novamente
    saveConfig(configs);
  }
}

module.exports = { configExist,getConfig,saveConfig,checkConfigValue };
