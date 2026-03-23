import { Router } from "express";
const routerCache = Router();
import { config } from "dotenv";
import { getConfig, checkConfigValue } from "../configHelper.cjs";
import { log } from "../logger/index.cjs";

const logPath = "cache.txt";

config();
checkConfigValue("cacheDurationInMinutes", 30);

/**
 * Middleware de cache HTTP.
 * Define headers de cache para o cliente/proxy.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */
routerCache.get("/*name", (req, res, next) => {
  const configs = getConfig();

  if (req.headers["x-disable-cache"] === "true") {
    log(
      `🚫 Cache desativado para esta requisição. ${req.method}:${req.path}`,
      logPath
    );

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");

    next();
    return;
  }

  const cacheTimeInSeconds = 60 * configs.cacheDurationInMinutes;

  log(
    `✅ Adicionando header de cache de ${configs.cacheDurationInMinutes} minutos. ${req.method}:${req.path}`,
    logPath
  );

  res.set("Cache-Control", `public, max-age=${cacheTimeInSeconds}`);
  res.set("Cache-Time", String(cacheTimeInSeconds));

  next();
});

export default routerCache;