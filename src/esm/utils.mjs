import fs from "fs";
import path from "path";
import { fwrite } from "./autoFileSysModule.mjs";
import xss from "xss";
import { requestLogger } from "./requestLogger.mjs";
import setCacheHeaders from "./cacheSys.mjs";
import httpsSecurityMiddleware from "./httpsSecurity.mjs";
import checkHeaderMiddleware from "./checkHeaderMiddleware.mjs";
import { autoLoader } from "./autoFileSysModule.mjs";
const modulePath = path.resolve(
  path.join(
    "node_modules",
    "npm-package-nodejs-utils-lda",
    "src",
    "public",
    "pages"
  )
);
// arquivos que o servidor do usuario poderia ter
let forbiddenFilePath = verifyHostedFiles("forbidden");
let notfoundFilePath = verifyHostedFiles("not-found");
let landingFilePath = verifyHostedFiles("index");

function verifyHostedFiles(filePathName) {
  let filePath = path.resolve(
    path.join("src", "pages", `${filePathName}.html`)
  );
  // Verifica se o arquivo .html existe
  if (!fs.existsSync(filePath)) {
    const defaultForbiddenFilePath = path.join(
      modulePath,
      `${filePathName}.html`
    );

    console.error(
      `\n[npm-package-nodejs-utils-lda] WARN: not found: ${filePath} using: ${defaultForbiddenFilePath}\n`
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
    forbidden(
      res,
      "Acesso negado para API Chave invalida para essa API! invalid or missing api key!"
    );
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

export function serverTry(res, callback) {
  try {
    callback();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}

export function requestStatus(response) {
  const status = response.status;
  const contentType = response.headers.get("content-type");

  log(`Status da resposta: ${status} - ${response.statusText}`);
  log(`Tipo de conteúdo: ${contentType}`);
}

export function parseFetchResponse(response) {
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

export function applyAutoMiddlewares(app) {
  // Middlewares já aplicados ao app
  app.use(requestLogger);
  app.use(setCacheHeaders);
  app.use(httpsSecurityMiddleware);
  checkHeaderMiddleware(app);
  autoLoader(app);

  console.log(
    "\n\t[npm-package-nodejs-utils-lda] Automatic middlewares loaded!\n"
  );
}

