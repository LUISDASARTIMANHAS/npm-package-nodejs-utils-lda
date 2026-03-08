import express from "express";
import { landingPage, sanitizeNetworkInterfaces } from "./utils.mjs";
import { log } from "./logger/index.mjs";
import os from "os";
const routerStatusDash = express.Router();

routerStatusDash.get("/", (req, res) => {
  log(`[SYSTEM] GET STATUS DASHBOARD: ${req.url}`);
  landingPage(res);
});

routerStatusDash.get("/status", (req, res) => {
  try {
    const rawInterfaces = os.networkInterfaces();

    res.json({
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
      cpuUsage: os.loadavg(),
      memoryUsage: process.memoryUsage(),
      platform: os.platform(),
      cpuCores: os.cpus().length,
      totalMemoryGB: toGB(os.totalmem()),
      freeMemoryGB: toGB(os.freemem()),
      network: sanitizeNetworkInterfaces(rawInterfaces),
    });
  } catch (e) {
    res.status(503).json({ message: "ERROR" });
  }
});


/**
 * Converte bytes para KB
 * @param {number} bytes
 * @return {string}
 */
function toKB(bytes) {
  return (bytes / 1024).toFixed(2);
}

/**
 * Converte bytes para MB
 * @param {number} bytes
 * @return {string}
 */
function toMB(bytes) {
  return (toKB(bytes) / 1024).toFixed(2);
}

/**
 * Converte bytes para GB
 * @param {number} bytes
 * @return {string}
 */
function toGB(bytes) {
  return (toMB(bytes) / 1024).toFixed(2);
}

export default routerStatusDash;
