import cors from "cors";
import { hsts } from "helmet";
import { fopen, fwrite } from "./autoFileSysModule.mjs";
import { configExist } from "./utils.mjs";
const configs = fopen("config.json");

configExist();
checkConfigIntegrity();

function httpsSecurityMiddleware(req, res, next) {
  console.log("executando https security");
  const corsOptions = {
    origin: configs.origin,
    methods: configs.methods,
    allowedHeaders: configs.allowedHeaders,
    optionsSuccessStatus: 204,
  };
  const hstsOptions = {
    maxAge: 365 * 24 * 60 * 60,
    includeSubDomains: true,
    preload: true,
  };

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
    hsts(hstsOptions)(req, res, next);
  });
}

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  if (!configs.origin) {
    configs.origin = ["/^https:\/\/.+/"];
  }
  if (!configs.methods) {
    configs.methods = "GET,PUT,POST,DELETE";
  }
  if (!configs.allowedHeaders) {
    configs.allowedHeaders = [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "authorization",
      "id",
      "key",
      "urlParams",
      "cache-control",
    ];
  }
  // salva novamente
  fwrite("config.json", configs);
}

export default httpsSecurityMiddleware;
