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
  const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  const isPlainObject = (obj) => obj !== null && typeof obj === "object" && !Array.isArray(obj);
  const isValidSegment = (seg) => typeof seg === "string" && seg.trim() !== "" && !isUnsafeKey(seg);

  if (typeof key !== "string" || key.trim() === "") {
    console.warn("[checkConfigValue] invalid key path");
    return;
  }

  const keys = key.split(".");
  if (keys.some((seg) => !isValidSegment(seg))) {
    console.warn("[checkConfigValue] unsafe or invalid key path blocked");
    return;
  }

  let current = configs;

  // percorre até a última chave
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];

    if (!isPlainObject(current)) {
      return;
    }

    // só permite descer/criar em propriedade própria
    if (!hasOwn(current, k)) {
      current[k] = Object.create(null);
    } else if (!isPlainObject(current[k])) {
      return;
    }

    current = current[k];
  }

  const lastKey = keys[keys.length - 1];
  if (!isValidSegment(lastKey) || !isPlainObject(current)) {
    return;
  }

  // defesa em profundidade no sink: nunca grava em alvo inseguro
  if (isUnsafeKey(lastKey) || !hasOwn(Object(current), lastKey) && !isPlainObject(current)) {
    return;
  }

  // só define se não existir como propriedade própria
  if (!hasOwn(current, lastKey)) {
    current[lastKey] = value;
    saveConfig(configs);
  }
}