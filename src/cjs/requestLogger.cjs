const { fopen, fwrite, log } = require("./autoFileSysModule.cjs");
const { configExist } = require("./utils.cjs");

configExist(); // garante que config.json existe
checkConfigIntegrity();

function requestLogger(req, res, next) {
  const configs = fopen("config.json");
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

  log(
    `REQ [${new Date().toISOString()}] IP=${ip}, URL=${
      req.originalUrl
    }, UA=${userAgent}`,
    "requestLogger.txt"
  );

  next();
}

function checkConfigIntegrity() {
  const configs = fopen("config.json");
  if (!configs.requestLogger) configs.requestLogger = {};
  if (configs.requestLogger.enabled === undefined)
    configs.requestLogger.enabled = true;
  fwrite("config.json", configs);
}

module.exports = requestLogger;
