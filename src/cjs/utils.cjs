const fs = require("fs");
const path = require("path");
const os = require("os");
const express = require("express");
const { fwrite, autoLoader } = require("./autoFileSysModule.cjs");
const xss = require("xss");
const modulePath = path.resolve(
  path.join(
    "node_modules",
    "npm-package-nodejs-utils-lda",
    "src",
    "public",
    "pages",
  ),
);
// arquivos que o servidor do usuario poderia ter
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
    forbidden(
      res,
      "Acesso negado para API Chave invalida para essa API! invalid or missing api key!",
    );
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

function exposeFolders(app, folderPath) {
  // Resolve o caminho combinando o local do arquivo atual com a pasta desejada
  const absolutePath = path.isAbsolute(folderPath)
    ? folderPath
    : path.resolve(folderPath);

  console.log(`\n\t[SYSTEM] AUTO EXPOSE FOLDER: ${absolutePath}`);

  // É recomendável usar o caminho absoluto aqui também para evitar erros de runtime
  app.use(express.static(absolutePath));

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
  sanitizeNetworkInterfaces,
  StatusDashboard,
};
