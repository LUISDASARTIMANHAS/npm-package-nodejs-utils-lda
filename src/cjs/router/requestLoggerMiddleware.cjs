const express = require("express");
const routerRequestLogger = express.Router();
const { log, logRequest } = require("../logger/index.cjs");
const { checkConfigValue, getConfig } = require("../configHelper.cjs");
const LOGS_DIR = "requestLogger.log";

checkConfigValue("requestLogger", {
  enabled: true,
});

routerRequestLogger.all("/*name", async (req, res, next) => {
  const configs = getConfig();
  if (!configs.requestLogger.enabled) return next();

  const userAgent = req.headers["user-agent"] || "Desconhecido";
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "IP não detectado";
  const referer = req.headers["referer"] || "Sem referer";

  await logRequest(req,null,LOGS_DIR);

  next();
});

module.exports = routerRequestLogger;