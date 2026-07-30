// configHelper.mjs
import fs from "fs";
import { fopen, fwrite } from "./autoFileSysModule.mjs"; // certifique-se de que autoFileSysModule também seja mjs

export function configExist() {
  if (!fs.existsSync("config.json")) {
    console.warn("\n[configExist] creating config...\n")
    fwrite("config.json", {});
  }
}
configExist();

export function getConfig() {
  configExist();
  const config = fopen("config.json");
  console.log("[configExist] load config!")
  return config;
}

export function saveConfig(data) {
  const config = fwrite("config.json", data);
  console.log("[configExist] save config!")
  return config;
}

/**
 * Define valor no config usando path (ex: "discordLogs.color")
 * @param {string} key
 * @param {any} value
 * @returns {void}
 */
export function checkConfigValue(key, value) {
  const configs = getConfig();

  const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);
  const isUnsafeKey = (k) => blockedKeys.has(k);

  const keys = key.split(".");
  let current = configs;

  // percorre até a última chave
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];

    if (isUnsafeKey(k)) {
      console.warn(`[checkConfigValue] unsafe key blocked: ${k}`);
      return;
    }

    // se não existir, cria objeto
    if (!current[k] || typeof current[k] !== "object") {
      current[k] = {};
    }

    current = current[k];
  }

  const lastKey = keys[keys.length - 1];

  if (isUnsafeKey(lastKey)) {
    console.warn(`[checkConfigValue] unsafe key blocked: ${lastKey}`);
    return;
  }

  // só define se não existir
  if (current[lastKey] === undefined) {
    current[lastKey] = value;
    saveConfig(configs);
  }
}