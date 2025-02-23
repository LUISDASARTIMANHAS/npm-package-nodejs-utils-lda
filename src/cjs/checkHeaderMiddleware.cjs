const fs = require("fs");
const express = require("express");
const {
  forbidden,
  validadeApiKey,
  conversorSimEnao,
  sanitize,
} = require("./utils.cjs");
const { fopen, fwrite } = require("./autoFileSysModule.cjs");
const xss = require("xss");
const path = require("path");
const { env } = require("process");
const dotenv = require("dotenv");
const routesDir = __dirname;
const rootDir = process.cwd();
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

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Verifica se o arquivo config.json existe
if (!fs.existsSync("config.json")) {
  // Se não existir, cria a pasta
  fwrite("config.json", {});
}

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
      console.log("-------------------------");
      console.log("SISTEMA <CHECK> <OBTER>: " + req.url);
      console.log("SISTEMA <ORIGEM>: " + origin);
      console.log("SISTEMA <PAYLOAD>: " + payload);

      for (const key in req.body) {
        const payloadValues = req.body[key];
        req.body[key] = xss(payloadValues);
        // *** PRECISA CORRIGIR A FALHA DO PONTO ***
        // req.body[key] = sanitize(payloadValues);
      }
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
  // Definir chaves padrão que são esperadas para autenticação
  const defaultKeys = ["ROOT:keyBypass"];
  const envKeys = Object.entries(env);

  // Filtrar as chaves do processo .env para incluir apenas aquelas que são apropriadas
  const keys = envKeys.reduce(
    (keys, [key, value]) => (key.startsWith("KEY_") ? [...keys, value] : keys),
    []
  );

  return defaultKeys.concat(keys);
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

module.exports = checkHeaderMiddleware;
