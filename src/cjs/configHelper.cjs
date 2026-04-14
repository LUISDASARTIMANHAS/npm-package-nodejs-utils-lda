// configHelper.cjs
const fs = require("fs");
const { fwrite, fopen } = require("./autoFileSysModule.cjs");

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
  console.log("[configExist] load config!");
  return config;
}

function saveConfig(data) {
  const config = fwrite("config.json", data);
  console.log("[configExist] save config!");
  return config;
}


/**
 * Define valor no config usando path (ex: "discordLogs.color")
 * @param {string} key
 * @param {any} value
 * @returns {void}
 */
function checkConfigValue(key, value) {
  const configs = getConfig();

  const keys = key.split(".");
  let current = configs;

  // percorre até a última chave
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];

    // se não existir, cria objeto
    if (!current[k] || typeof current[k] !== "object") {
      current[k] = {};
    }

    current = current[k];
  }

  const lastKey = keys[keys.length - 1];

  // só define se não existir
  if (current[lastKey] === undefined) {
    current[lastKey] = value;
    saveConfig(configs);
  }
}

module.exports = { configExist,getConfig,saveConfig,checkConfigValue };
