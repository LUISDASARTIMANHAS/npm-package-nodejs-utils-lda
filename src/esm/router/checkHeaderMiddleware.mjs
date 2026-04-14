import { Router } from "express";
const routerCheckHeaderMiddleware = Router();
import { forbidden, validadeApiKey, SanitizeXSS, exposePublicFolder, exposeLogsFolder } from "../utils.mjs";
import { env } from "process";
import { config } from "dotenv";
import { checkConfigValue, getConfig } from "../configHelper.mjs";
import { log, logError } from "../logger/index.mjs";
const logPath = "authorization.txt";

// Carregar variáveis de ambiente do arquivo .env
config();

checkConfigValue("blockedRoutes", [
  "/default/api",
  "/api/auth"
]);
// DEFAULT STATIC PUBLIC ITENS
exposePublicFolder(routerCheckHeaderMiddleware);

routerCheckHeaderMiddleware.all("/api/*name", (req, res, next) => {
  if (!req.headers["authorization"]) {
    return forbidden(
      res,
      "[npm-package-nodejs-utils-lda] [checkHeaderMiddleware] Autorização de acesso minima faltante para essa rota! Minimum access authorization is missing for this route!",
    );
  }
  res.set("Content-Type", "application/json");
  next();
});

/**
 * Permite acessar arquivos individuais
 */
routerCheckHeaderMiddleware.all("/*name", (req, res, next) => {
  const origin = req.headers.referer || req.headers.referrer;
  const blockRoutesPresent = isBlockedRoute(req);
  const payload = JSON.stringify(req.body, null, 2);
  const headers = req.headers;

  // Combinar chaves padrão e do .env filtradas
  const keys = getKeys();
  if (blockRoutesPresent) {
    return validadeApiKey(req, res, keys);
  } else {
    log("-------------------------", logPath);
    log(`SYSTEM <CHECK> <GET>: ${req.url}`, logPath);
    log(`SYSTEM <ORIGEN>: ${origin}`, logPath);
    log(`SYSTEM <PAYLOAD>: ${payload}`, logPath, 1000);
    log(`SYSTEM <HEADERS>: ${JSON.stringify(headers)}`, logPath, 2000);
    log(
      `SYSTEM <REQUIRED VALID KEY>: ${blockRoutesPresent}, change in config.blockedRoutes`,
      logPath,
    );

    SanitizeXSS(req.body);
    next();
  }
});

function isBlockedRoute(req) {
  const configs = getConfig();
  const arrayBlockedRoutes = configs.blockedRoutes || [];
  return arrayBlockedRoutes.some((route) => {
    // Trata rotas com curingas
    const regex = new RegExp(`^${route.replace(/\*/g, ".*")}$`);
    return regex.test(req.path);
  });
}
function getKeys() {
  // Chaves padrão usadas caso nenhuma seja encontrada no .env
  const defaultKeys = ["ROOT:keyBypass"];
  // Obter as entradas do objeto 'env'
  const environmentEntries = Object.entries(env);
  // Filtrar apenas as chaves que começam com 'KEY_'
  const keyEntries = environmentEntries.filter(([key, _]) =>
    key.startsWith("KEY_"),
  );
  // Extrair apenas os valores das chaves filtradas
  const extractedKeys = keyEntries.map(([_, value]) => value);

  // Verificar se há alguma chave extraída, senão retorna as padrão
  const finalKeys = extractedKeys.length > 0 ? extractedKeys : defaultKeys;

  return finalKeys;
}

export default routerCheckHeaderMiddleware;
