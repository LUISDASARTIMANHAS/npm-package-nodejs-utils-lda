const express = require("express");
const fs = require("fs");
const path = require("path");
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

function fopen(filePath) {
  const database = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(database);

  return data;
}

function fwrite(filePath, data) {
  const formatData = JSON.stringify(data, null, 2);

  fs.writeFileSync(filePath, formatData, "utf8");
  return true;
}

// Função para converter uma string em uma representação binária
function stringToBinary(str, binaryLenght) {
  if (!binaryLenght) {
    binaryLenght = 8;
  }
  const binary = str
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(2).padStart(binaryLenght, "0");
    })
    .join(" ");
  return binary;
}

// Função para converter uma representação binária em uma string
function binaryToString(binary, binaryLenght) {
  if (!binaryLenght) {
    binaryLenght = 2;
  }
  const jsonString = binary
    .split(" ")
    .map((bin) => {
      return String.fromCharCode(parseInt(bin, binaryLenght));
    })
    .join("");

  return jsonString;
}

// Função para salvar dados JSON como binário
function fwriteBin(filePath, data) {
  const jsonString = JSON.stringify(data);
  const binaryString = stringToBinary(jsonString);

  fs.writeFileSync(filePath, binaryString, "utf8");
  return true;
}

// Leitura e conversão de volta para JSON
function freadBin(filePath) {
  const binaryString = fs.readFileSync(filePath, "utf8");
  const string = binaryToString(binaryString);
  const data = JSON.parse(string);

  return data;
}

// Carrega dinamicamente todos os módulos de rota
function autoLoader(app) {
  // DEFAULT STATIC PAGES AND CSS
  app.use(express.static(defaultCss));
  app.use(express.static(defaultPages));

  app.use(express.static(css));
  app.use(express.static(pages));
  fs.readdirSync(rootDir).forEach((file) => {
    const filePath = path.resolve(rootDir, file);
    console.log(`File ${filePath} `);

    if (file.endsWith(".js") && file !== "server.js") {
      const route = require(filePath);

      app.use(route);
      console.log(`File ${file} loaded auto!`);
    }
  });
}

module.exports = {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
};
