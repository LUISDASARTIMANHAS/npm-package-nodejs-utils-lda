const fs = require("fs");
const path = require("path");
const os = require("os");
const express = require("express");
const { fwrite, autoLoader } = require("./autoFileSysModule.cjs");
const xss = require("xss");
const { log, logError } = require("./logger/index.cjs");
const modulePath = path.resolve(
  path.join(
    "node_modules",
    "npm-package-nodejs-utils-lda",
    "src",
    "public",
    "pages",
  ),
);

const modulePublicFolder = path.join(
  "node_modules",
  "npm-package-nodejs-utils-lda",
  "src",
  "public",
);

// arquivos que o servidor do usuario poderia ter
const LOGS_DIR = "logs";
let forbiddenFilePath = verifyHostedFiles("forbidden");
let notfoundFilePath = verifyHostedFiles("not-found");
let landingFilePath = verifyHostedFiles("index");

function verifyHostedFiles(filePathName) {
  let filePath = path.resolve(
    path.join("src", "pages", `${filePathName}.html`),
  );
  // Verifica se o arquivo .html existe
  if (!fs.existsSync(filePath)) {
    const defaultForbiddenFilePath = path.join(
      modulePath,
      `${filePathName}.html`,
    );

    console.error(
      `\n[npm-package-nodejs-utils-lda] WARN: not found: ${filePath} using: ${defaultForbiddenFilePath}\n`,
    );
    // usa o default da blibioteca
    filePath = defaultForbiddenFilePath;
  }
  return filePath;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomBin(max) {
  return Math.floor(Math.random() * max).toString(2);
}

function getRandomHex(max) {
  return Math.floor(Math.random() * max).toString(16);
}

function generateToken() {
  let token = "";
  let tentativas = 0;
  const maxLength = 32;

  while (token.length < maxLength) {
    // Gera um valor hexadecimal
    let hex = getRandomHex(256);
    // Adiciona o valor ao token
    token += hex;
    tentativas++;
  }
  console.log(`Generated Token in ${tentativas} attempts`);

  // Garante que o token tenha exatamente 32 caracteres
  return token.substring(0, maxLength);
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", options);
}

function sanitize(text) {
  if (typeof text === "string") {
    return text.replace(/[^a-zA-Z0-9://\s]/g, "");
  }
  return null; // ou outra ação apropriada caso não seja uma string
}

function SanitizeXSS(object) {
  for (const key in object) {
    const values = object[key];
    object[key] = xss(values);
  }
}

function validadeApiKey(req, res, key) {
  const keyHeader = req.headers["authorization"];
  const authApi = keyHeader && key.includes(keyHeader);

  if (!authApi) {
    forbidden(res, {
      error:
        "[npm-package-nodejs-utils-lda] [validadeApiKey] Acesso negado para API Chave invalida para essa API! Access denied for API. Invalid key for this API!",
      keyHeader: keyHeader,
    });
  }
}

function conversorSimEnao(value) {
  if (value) {
    return "✔Voce foi autorizado, esta tudo correto";
  }
  return "⚠Esta faltando algo ou não foi autorizado!";
}

function notfound(res) {
  console.error("notfound 404");
  res.status(404);
  res.sendFile(notfoundFilePath);
}

function forbidden(res, error) {
  console.error("forbidden 403");
  res.status(403);
  if (error) {
    return res.json(error);
  }
  res.sendFile(forbiddenFilePath);
}

function landingPage(res) {
  res.status(200);
  res.sendFile(landingFilePath);
}

function StatusDashboard(app) {
  app.get("/", (req, res) => {
    log(`{SYSTEM] GET STATUS DASHBOARD: ${req.url}`);
    landingPage(res);
  });

  app.get("/status", (req, res) => {
    try {
      const rawInterfaces = os.networkInterfaces();

      res.json({
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
        cpuUsage: os.loadavg(),
        memoryUsage: process.memoryUsage(),
        platform: os.platform(),
        cpuCores: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        network: sanitizeNetworkInterfaces(rawInterfaces),
      });
    } catch (e) {
      res.status(503).json({ message: "ERROR" });
    }
  });
  return true;
}

function unauthorized(res, error) {
  console.error("unauthorized 401");
  res.status(401);
  if (error) {
    return res.json(error);
  }
  res.sendStatus(401);
}

function serverTry(res, callback) {
  try {
    callback();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}

function requestStatus(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  log(`Status da resposta: ${status} - ${response.statusText}`);
  log(`Tipo de conteúdo: ${contentType}`);
}

function parseFetchResponse(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  requestStatus(response);

  // Verifica o tipo de conteúdo retornado
  if (contentType && contentType.includes("application/json")) {
    // Se for JSON, retorna o JSON
    return response.json().then((data) => ({ data, status }));
  } else {
    // Se não for JSON, retorna o conteúdo como texto
    return response.text().then((data) => ({ data, status }));
  }
}

// utils.js ou no seu pacote
function applyAutoMiddlewares(app) {
  const requestLogger = require("./requestLogger.cjs");
  const setCacheHeaders = require("./cacheSys.cjs");
  const httpsSecurityMiddleware = require("./httpsSecurity.cjs");
  const checkHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
  // Middlewares já aplicados ao app
  app.use(requestLogger);
  app.use(setCacheHeaders);
  app.use(httpsSecurityMiddleware);
  checkHeaderMiddleware(app);
  autoLoader(app);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n",
  );
}

function exposeFolders(app, folderPath, route) {
  // Resolve o caminho combinando o local do arquivo atual com a pasta desejada
  const absolutePath = path.isAbsolute(folderPath)
    ? folderPath
    : path.resolve(folderPath);
  const sanitizedRoute = route || "/";

  console.log(`\n\t[SYSTEM] AUTO EXPOSE FOLDER: ${absolutePath}`);

  // É recomendável usar o caminho absoluto aqui também para evitar erros de runtime
  app.use(sanitizedRoute, express.static(absolutePath));

  return true;
}

function exposePublicFolder(app) {
  const publicItens = path.join("public");
  const route = "/public";
  exposeFolders(app, publicItens, route);
  exposeFolders(app, modulePublicFolder, route);
}

function exposeLogsFolder(app) {
  const publicItens = path.join("logs");
  const route = "/logs";
  exposeFolders(app, publicItens, route);
}

/**
 * Registra rota dinâmica para listagem e acesso aos logs
 * @param {import("express").Express} app
 * @returns {boolean}
 */
function logsDashboard(app) {
  /**
   * Lista arquivos da pasta /logs
   */
  app.get("/logs", async (req, res) => {
    try {
      const files = await fs.promises.readdir(LOGS_DIR);

      const fileLinks = files
        .map((file) => {
          return `
            <li class="list-group-item">
              <a href="/logs/${file}" target="_blank">${file}</a>
            </li>
          `;
        })
        .join("");

      res.status(200).send(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Logs Dashboard</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-dark text-light">
          <div class="container py-5">
            <h1 class="mb-4">Logs Dashboard</h1>
            <ul class="list-group">
              ${fileLinks || "<li class='list-group-item'>Nenhum arquivo encontrado</li>"}
            </ul>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("ERRO REAL:", error);
      res.status(500).send("Erro ao listar arquivos.");
    }
  });

  /**
   * Permite acessar arquivos individuais
   */
  app.get("/logs/:filename", (req, res) => {
    const filePath = path.join(LOGS_DIR, req.params.filename);

    // Proteção contra path traversal
    if (!filePath.startsWith(LOGS_DIR)) {
      return res.status(403).send("Acesso negado.");
    }

    res.sendFile(filePath);
  });

  return true;
}

/**
 * Resume interfaces de rede sem dados sensíveis
 * @param {Object} interfaces
 * @return {{interfaces:number, ipv4:boolean, ipv6:boolean}}
 */
function sanitizeNetworkInterfaces(interfaces) {
  let hasIPv4 = false;
  let hasIPv6 = false;
  let count = 0;

  for (const iface of Object.values(interfaces)) {
    count++;
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) hasIPv4 = true;
      if (addr.family === "IPv6" && !addr.internal) hasIPv6 = true;
    }
  }

  return {
    interfaces: count,
    ipv4: hasIPv4,
    ipv6: hasIPv6,
  };
}

module.exports = {
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  validadeApiKey,
  unauthorized,
  forbidden,
  notfound,
  landingPage,
  formatDate,
  conversorSimEnao,
  sanitize,
  SanitizeXSS,
  serverTry,
  requestStatus,
  parseFetchResponse,
  applyAutoMiddlewares,
  exposeFolders,
  exposePublicFolder,
  exposeLogsFolder,
  sanitizeNetworkInterfaces,
  StatusDashboard,
  logsDashboard,
};
