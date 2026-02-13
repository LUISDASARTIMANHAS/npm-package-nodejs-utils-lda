import path from "path";
import { exposeLogsFolder, exposePublicFolder, forbidden, SanitizeXSS, validadeApiKey } from "./utils.mjs";
import { fopen, fwrite } from "./autoFileSysModule.mjs";
import { log, logError } from "./logger/index.mjs";
import { env } from "process";
import { config } from "dotenv";
import { configExist } from "./configHelper.mjs";
const logPath = "headerSys.txt";
config();

configExist();
checkConfigIntegrity();

function checkHeaderMiddleware(app) {
  // DEFAULT STATIC PUBLIC ITENS
  exposePublicFolder(app);
  exposeLogsFolder(app);

  // Middleware para configurar o tipo de conteúdo como JSON
  app.all("/api/*name", (req, res, next) => {
    if (!req.headers["authorization"]) {
      return forbidden(
        res,
        "Autorização de acesso minima faltante para essa rota! authorization is null!"
      );
    }
    res.set("Content-Type", "application/json");
    next();
  });

  app.all("/*name", (req, res, next) => {
    const origin = req.headers.referer || req.headers.referrer;
    const keyHeader = req.headers["authorization"];
    const blockRoutesPresent = isBlockedRoute(req);
    const payload = JSON.stringify(req.body, null, 2);

    // Combinar chaves padrão e do .env filtradas
    const keys = getKeys();
    if (blockRoutesPresent) {
      return validadeApiKey(req, res, keys);
    } else {
      log("-------------------------",logPath);
      log(`SYSTEM <CHECK> <GET>: ${req.url}`,logPath);
      log(`SYSTEM <ORIGEM>: ${origin}`,logPath);
      log(`SYSTEM <PAYLOAD>: ${payload}`,logPath);

      SanitizeXSS(req.body);
      next();
    }
  });
}

function isBlockedRoute(req) {
  const configs = fopen("config.json");
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
  const keyEntries = environmentEntries.filter(([key, _]) => key.startsWith("KEY_"));
  // Extrair apenas os valores das chaves filtradas
  const extractedKeys = keyEntries.map(([_, value]) => value);

  // Verificar se há alguma chave extraída, senão retorna as padrão
  const finalKeys = extractedKeys.length > 0 ? extractedKeys : defaultKeys;

  return finalKeys;
}

function checkConfigIntegrity() {
  // obtem config.json
  const configs = fopen("config.json");
  // verifica se blockedRoutes não existe
  if (!configs.blockedRoutes) {
    // caso não exista configura para uma rota padrão
    configs.blockedRoutes = ["/default/api"];
    // salva novamente
    fwrite("config.json", configs);
  }
}

export default checkHeaderMiddleware;
