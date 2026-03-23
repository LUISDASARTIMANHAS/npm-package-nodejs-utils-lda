import fs from "fs";
import path from "path";
import express from "express";
import { fwrite } from "./autoFileSysModule.mjs";
import xss from "xss";
import { requestLogger } from "./requestLogger.mjs";
import setCacheHeaders from "./cacheSys.mjs";
import httpsSecurityMiddleware from "./router/httpsSecurity.mjs";
import checkHeaderMiddleware from "./checkHeaderMiddleware.mjs";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import routerStatusDash from "./router/routerStatusDash.mjs";
import routerLogsDash from "./router/routerLogsDash.mjs";
const bloqueados = ["cd", "format", "shutdown", "rd", "del", "rmdir", "erase"];
const modulePath = path.resolve(
  path.join(
    "node_modules",
    "npm-package-nodejs-utils-lda",
    "src",
    "public",
    "pages",
  ),
);

/**
 * Diretório onde estão os logs
 */
const modulePublicFolder = path.join(
  "node_modules",
  "npm-package-nodejs-utils-lda",
  "src",
  "public",
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getRandomBin(max) {
  return Math.floor(Math.random() * max).toString(2);
}

export function getRandomHex(max) {
  return Math.floor(Math.random() * max).toString(16);
}

export function generateToken() {
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

export function formatDate(dateString) {
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

export function sanitize(text) {
  if (typeof text === "string") {
    return text.replace(/[^a-zA-Z0-9://\s]/g, "");
  }
  return null; // ou outra ação apropriada caso não seja uma string
}

export function SanitizeXSS(object) {
  for (const key in object) {
    const values = object[key];
    object[key] = xss(values);
  }
}

export function validadeApiKey(req, res, key) {
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

export function conversorSimEnao(value) {
  if (value) {
    return "✔Voce foi autorizado, esta tudo correto";
  }
  return "⚠Esta faltando algo ou não foi autorizado!";
}

export function notfound(res) {
  console.error(404);
  res.status(404);
  res.sendFile(notfoundFilePath);
}

export function forbidden(res, error) {
  console.error(403);
  res.status(403);
  if (error) {
    return res.json(error);
  }
  res.sendFile(forbiddenFilePath);
}

export function unauthorized(res, error) {
  console.error(401);
  res.status(401);
  if (error) {
    return res.json(error);
  }
  res.sendStatus(401);
}

export function landingPage(res) {
  res.status(200);
  res.sendFile(landingFilePath);
}

export function StatusDashboard(mainRouter) {
  mainRouter.use("/", routerStatusDash);
  return mainRouter;
}

export function serverTry(res, callback) {
  try {
    callback();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}

export function applyAutoMiddlewares(app) {
  // Middlewares já aplicados ao app
  app.use(requestLogger);
  app.use(setCacheHeaders);
  app.use(httpsSecurityMiddleware);
  checkHeaderMiddleware(app);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n",
  );
}

export function exposeFolders(app, folderPath, route) {
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

export function exposePublicFolder(app) {
  const publicItens = path.join("public");
  const route = "/public";
  exposeFolders(app, publicItens, route);
  exposeFolders(app, modulePublicFolder, route);
}

export function exposeLogsFolder(app) {
  const publicItens = path.join("logs");
  const route = "/logs";
  exposeFolders(app, publicItens, route);
}

/**
 * Resume interfaces de rede sem dados sensíveis
 * @param {Object} interfaces
 * @return {{interfaces:number, ipv4:boolean, ipv6:boolean}}
 */
export function sanitizeNetworkInterfaces(interfaces) {
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

export function fileExistAndCreate(filePath, defaultContent = []) {
  if (!fs.existsSync(filePath)) {
    fwrite(filePath, defaultContent);
  }
}

/**
 * Sanitiza o input do usuário, permitindo apenas caracteres seguros.
 * Remove qualquer coisa que possa ser interpretada como comando shell.
 * @param {string} input
 * @returns {string} input sanitizado
 */
function sanitizeInput(input) {
  if (typeof input !== "string") throw new Error("Input must be a string");
  // permite apenas letras, números, pontos, hífens e dois-pontos (para IPs)
  const sanitized = input.replace(/[^a-zA-Z0-9.-:]/g, "");
  if (!sanitized) throw new Error("Invalid input after sanitization");
  return sanitized;
}

/**
 * Executa um comando no Windows CMD de forma segura.
 * @param {string} cmd - comando base (ex: "nslookup")
 * @param {string[]} args - argumentos do comando (ex: ["google.com"])
 * @returns {Promise<string>} - saída do comando
 */
export async function shell(cmd, args = []) {
  // valida o comando base
  const cmdLower = cmd.toLowerCase();
  if (bloqueados.some((p) => cmdLower.includes(p))) {
    throw new Error(`This command is blocked for safety. 🚫`);
  }

  // sanitiza todos os argumentos
  const safeArgs = args.map((a) => sanitizeInput(a));

  return new Promise((resolve, reject) => {
    // monta o comando seguro
    const fullCmd = [cmd, ...safeArgs].join(" ");

    exec(fullCmd, { shell: "cmd.exe" }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout || "Command executed with no output.");
    });
  });
}
