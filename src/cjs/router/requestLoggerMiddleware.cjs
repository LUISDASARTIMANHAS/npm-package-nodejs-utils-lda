const express = require("express");
const routerRequestLogger = express.Router();
const { log } = require("../logger/index.cjs");
const { checkConfigValue, getConfig } = require("../configHelper.cjs");
const LOGS_DIR = "requestLogger.txt";

checkConfigValue("requestLogger", {
  enabled: true,
});

routerRequestLogger.all("/", async (req, res, next) => {
  const configs = getConfig();
  if (!configs.requestLogger.enabled) return next();

  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "IP não detectado";
  const referer = req.headers["referer"] || "Sem referer";

  console.log("\n--- NEW REQUEST ---");
  console.log("IP:", ip);
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Referer:", referer);
  console.log("User-Agent:", userAgent);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("------------------------\n");

  await log(
    `REQ [${new Date().toISOString()}] IP=${ip}, URL=${
      req.originalUrl
    }, UA=${userAgent}`,
    LOGS_DIR,
  );

  next();
});

module.exports = routerRequestLogger;
