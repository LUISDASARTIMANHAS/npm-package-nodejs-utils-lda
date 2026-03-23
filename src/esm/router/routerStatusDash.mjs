import { Router } from "express";
import { landingPage, sanitizeNetworkInterfaces } from "../utils.cjs";
import { log } from "../logger/index.cjs";
import { networkInterfaces, loadavg, platform as _platform, cpus, totalmem, freemem } from "os";
const routerStatusDash = Router();

routerStatusDash.get("/", (req, res) => {
  log(`[SYSTEM] GET STATUS DASHBOARD: ${req.url}`);
  landingPage(res);
});

routerStatusDash.get("/status", (req, res) => {
  try {
    const rawInterfaces = networkInterfaces();

    res.json({
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
      cpuUsage: loadavg(),
      memoryUsage: process.memoryUsage(),
      platform: _platform(),
      cpuCores: cpus().length,
      totalMemoryGB: toGB(totalmem()),
      freeMemoryGB: toGB(freemem()),
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
