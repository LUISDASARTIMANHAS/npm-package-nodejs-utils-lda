import path from "path";
import express from "express";
import { configExist, forbidden, SanitizeXSS, validadeApiKey } from "./utils.mjs";
import { fopen, fwrite, log } from "./autoFileSysModule.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { env } from "process";
import { config } from "dotenv";
config();

// Obtém o caminho absoluto do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const routesDir = dirname(__filename);
const pages = routesDir + "/src/pages";
const css = routesDir + "/src/css";
// isso deixara os arquivos estaticos na raiz usando app.use(express.static(defaultPages)) ex: /not-found.html
const defaultPages = path.join(
  "node_modules",
  "npm-package-nodejs-utils-lda",
  "src",
  "pages"
);
// isso deixara os arquivos estaticos na raiz usando app.use(express.static(defaultCss)) ex: /not-found.css
const defaultCss = path.join(
  "node_modules",
  "npm-package-nodejs-utils-lda",
  "src",
  "css"
);

configExist();
checkConfigIntegrity();

function checkHeaderMiddleware(app) {
  // DEFAULT STATIC PAGES AND CSS
  [defaultCss, defaultPages, css, pages].forEach((dir) =>
    app.use(express.static(dir))
  );

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
