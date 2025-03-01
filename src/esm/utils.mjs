import fs from "fs";
import path from "path";
import { fwrite } from "./autoFileSysModule.mjs";

let forbiddenFilePath = path.resolve(
  path.join("src", "pages", "forbidden.html")
);
let notfoundFilePath = path.resolve(
  path.join("src", "pages", "not-found.html")
);

// Verifica se o arquivo forbidden.html existe
if (!fs.existsSync(forbiddenFilePath)) {
  const defaultForbiddenFilePath = path.resolve(
    path.join(
      "node_modules",
      "npm-package-nodejs-utils-lda",
      "src",
      "pages",
      "forbidden.html"
    )
  );
  console.error(
    `Err: not found forbiddenFilePath: ${forbiddenFilePath} using: ${defaultForbiddenFilePath}`
  );
  // usa o default da blibioteca
  forbiddenFilePath = defaultForbiddenFilePath;
}

// Verifica se o arquivo not-found.html existe
if (!fs.existsSync(notfoundFilePath)) {
  const defaultNotfoundFilePath = path.resolve(
    path.join(
      "node_modules",
      "npm-package-nodejs-utils-lda",
      "src",
      "pages",
      "not-found.html"
    )
  );
  console.error(
    `Err: not found defaultNotfoundFilePath: ${notfoundFilePath} using: ${defaultNotfoundFilePath}`
  );
  // usa o default da blibioteca
  notfoundFilePath = defaultNotfoundFilePath;
}

export function configExist() {
  // Verifica se o arquivo config.json existe
  if (!fs.existsSync("config.json")) {
    // Se não existir, cria o arquivo
    fwrite("config.json", {});
  }
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

export function validadeApiKey(req, res, key) {
  const keyHeader = req.headers["authorization"];
  const authApi = keyHeader && key.includes(keyHeader);

  if (!authApi) {
    forbidden(res, "invalid or missing api key!");
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

export function serverTry(res, callback) {
  try {
    callback();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}
