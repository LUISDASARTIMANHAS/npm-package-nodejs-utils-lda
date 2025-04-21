const { fopen, fwrite } = require("./autoFileSysModule.cjs");
const cors = require("cors");
const helmet = require("helmet");
const { configExist } = require("./utils.cjs");
const configs = fopen("config.json");

configExist();
checkConfigIntegrity();

function httpsSecurityMiddleware(req, res, next) {
  console.log("executando https security");
  const ALLOWED_USER_AGENTS = configs.ALLOWED_USER_AGENTS;
  const corsOptions = {
    origin: configs.ORIGIN,
    methods: configs.METHODS,
    allowedHeaders: configs.ALLOWED_HEADERS,
    optionsSuccessStatus: 204,
  };
  const hstsOptions = {
    maxAge: 365 * 24 * 60 * 60,
    includeSubDomains: true,
    preload: true,
  };
  // Verificação do User-Agent
  const userAgent = req.get("user-agent") || "";
  const isAllowedUserAgent = ALLOWED_USER_AGENTS.some((ua) =>
    userAgent.includes(ua)
  );

  if (!isAllowedUserAgent) {
    console.warn(
      `Blocked UA: '${userAgent}' | IP: ${req.ip} | URL: ${req.originalUrl}`
    );
    return res.status(403).send("User-Agent not authorized.");
  }

  // Chamando o middleware cors
  cors(corsOptions)(req, res, () => {
    // Configurar cabeçalhos de resposta para OPTIONS
    if (req.method === "OPTIONS") {
      console.log("SISTEMA OPTIONS CORS");
      res.set("Access-Control-Allow-Origin", corsOptions.origin);
      res.set("Access-Control-Allow-Methods", corsOptions.methods);
      res.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders);
    }

    // Chamando o middleware helmet
    helmet.hsts(hstsOptions)(req, res, next);
  });
}

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  if (!configs.ORIGIN) {
    configs.ORIGIN = ["/^https://.+/"];
  }
  if (!configs.METHODS) {
    configs.METHODS = "GET,PUT,POST,DELETE";
  }
  if (!configs.ALLOWED_HEADERS) {
    configs.ALLOWED_HEADERS = [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "authorization",
      "id",
      "key",
      "urlParams",
      "cache-control",
      "X-Disable-Cache",
    ];
  }
  if (!configs.ALLOWED_USER_AGENTS) {
    configs.ALLOWED_USER_AGENTS = [
      "Mozilla",
      "Chrome",
      "Firefox",
      "custom/1.0",
    ];
  }
  // salva novamente
  fwrite("config.json", configs);
}

module.exports = httpsSecurityMiddleware;
