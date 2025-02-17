import fs from "fs";
import path from "path";
import { fopen, fwrite, freadBin, fwriteBin } from "./autoFileSysModule.mjs";

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

function pesqUsuarioByEmail(file, email) {
  const data = freadBin(file);
  let pos = 0;

  for (pos = 0; pos < data.length; pos++) {
    var currentDB = data[pos];
    const currentEmail = currentDB.email;

    // Verifica se e o email
    const authEmail = currentEmail == email;

    console.log("-----SISTEMA----");
    console.log("TAMANHO: " + data.length);
    console.log("POSIÇÃO: " + pos);
    console.log("Pesquisando...");
    console.log("e-mail : " + email + " == " + currentEmail);

    // Verifica se o nome,usuário e email são verdadeiros
    if (authEmail) {
      return pos;
    }
  }
  return -1; // Retorna -1 se não foram encontrados usuarios no vetor
}

function pesqUsuario(file, username) {
  const data = freadBin(file);
  let pos = 0;

  for (pos = 0; pos < data.length; pos++) {
    var currentDB = data[pos];
    const currentUser = currentDB.usuario;

    // Verifica se e o usuario
    const authNome = currentUser == username;

    console.log("-----SISTEMA----");
    console.log("TAMANHO: " + data.length);
    console.log("POSIÇÃO: " + pos);
    console.log("Pesquisando...");
    console.log("User: " + username + " == " + currentUser);

    // Verifica se o nome,usuário e email são verdadeiros
    if (authNome) {
      return pos;
    }
  }
  return -1; // Retorna -1 se não foram encontrados usuarios no vetor
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
  const maxLength = 32; // Precisamos de exatamente 32 caracteres

  while (token.length < maxLength) {
    let hex = getRandomHex(256); // Gera um valor hexadecimal
    token += hex; // Adiciona o valor ao token
  }

  return token.substring(0, maxLength); // Garante que o token tenha exatamente 32 caracteres
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

function validadeApiKey(req, res, key) {
  const keyHeader = req.headers["authorization"];
  const authApi = keyHeader == key;

  if (!authApi) {
    forbidden(res);
  }
}

function conversorSimEnao(value) {
  if (value) {
    return "✔Voce foi autorizado, esta tudo correto";
  }
  return "⚠Esta faltando algo ou não foi autorizado!";
}

function notfound(res) {
  console.error(404);
  res.status(404);
  res.sendFile(notfoundFilePath);
}

function forbidden(res, error) {
  console.error(403);
  res.status(403);
  if (error) {
    return res.json(error);
  }
  res.sendFile(forbiddenFilePath);
}

function unauthorized(res, error) {
  console.error(401);
  res.status(401);
  if (error) {
    return res.json(error);
  }
  res.sendStatus(401);
}

export {
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  pesqUsuario,
  validadeApiKey,
  unauthorized,
  forbidden,
  notfound,
  formatDate,
  conversorSimEnao,
  sanitize,
};
