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
function isUnsafeKeySegment(segment) {
  return segment === "__proto__" || segment === "prototype" || segment === "constructor";
}

function checkConfigValue(key, value) {
  if (typeof key !== "string" || key.trim() === "") {
    throw new Error("[checkConfigValue] key must be a non-empty string");
  }

  const loadedConfig = getConfig();
  const keys = key.split(".");

  if (keys.some((segment) => !segment || isUnsafeKeySegment(segment))) {
    throw new Error("[checkConfigValue] invalid or unsafe config key path");
  }

  const safeConfigs = Object.create(null);
  if (loadedConfig && typeof loadedConfig === "object" && !Array.isArray(loadedConfig)) {
    Object.assign(safeConfigs, loadedConfig);
  }

  let current = safeConfigs;

  // percorre até a última chave
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = current[k];
    const isSafeObject =
      next &&
      typeof next === "object" &&
      !Array.isArray(next) &&
      (Object.getPrototypeOf(next) === null || Object.getPrototypeOf(next) === Object.prototype);

    // se não existir ou não for objeto simples/seguro, cria objeto sem protótipo
    if (!isSafeObject) {
      current[k] = Object.create(null);
    }

    current = current[k];
  }

  const lastKey = keys[keys.length - 1];

  // só define se não existir
  if (current[lastKey] === undefined) {
    current[lastKey] = value;
    saveConfig(safeConfigs);
  }
}

module.exports = { configExist,getConfig,saveConfig,checkConfigValue };
