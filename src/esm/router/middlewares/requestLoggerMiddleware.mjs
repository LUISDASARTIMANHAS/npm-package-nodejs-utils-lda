import express from "express";
const routerRequestLogger = express.Router();
import { log, logRequest } from "../../logger/index.mjs";
import { checkConfigValue, getConfig } from "../../configHelper.mjs";
const LOGS_DIR = "requestLogger.txt";

// garante que config.json existe
// configExist();
// checkConfigIntegrity();
checkConfigValue("requestLogger", {
  enabled: true,
});

routerRequestLogger.all("/", async (req, res, next) => {
  const configs = getConfig();
  if (!configs.requestLogger.enabled) return next();

  await logRequest(req,null,LOGS_DIR);

  next();
});

export function requestLoggerMiddleware(mainRouter) {
  mainRouter.use(routerRequestLogger);
  console.log("\n\t[npm-package-nodejs-utils-lda] [requestLogger] loaded!");
  return mainRouter;
}

export default requestLoggerMiddleware;
