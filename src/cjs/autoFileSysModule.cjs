const fs = require("fs");
const express = require("express");
const path = require("path");
const rootDir = process.cwd();
// isso deixara os arquivos estaticos na raiz usando app.use(express.static(publicItens)) ex: /not-found.html
const publicItens = path.join(
  "node_modules",
  "npm-package-nodejs-utils-lda",
  "src",
  "public"
);

function fopen(filePath) {
  if (!fs.existsSync(filePath)) {
    // Se for JSON, cria com objeto vazio; se for .txt, cria como string vazia
    console.error(`File not found. Creating new file: ${filePath}`);
    const defaultValue = filePath.endsWith(".json") ? {} : "";
    fwrite(filePath, defaultValue);
  }

  const content = fs.readFileSync(filePath, "utf8");

  // Se for JSON, tenta parsear
  if (filePath.endsWith(".json")) {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Error parsing JSON:", filePath);
      return {};
    }
  }

  // Para txt ou outros, retorna como string
  return content;
}

function fwrite(filePath, data) {
  let formatData = data;

  if (filePath.endsWith(".json")) {
    formatData = JSON.stringify(data, null, 2);
  }

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
  if (!fs.existsSync(filePath)) {
    // cria arquivo binário vazio com "{}" por padrão
    console.log(`File not found. Creating new file: ${filePath}`);
    fwriteBin(filePath, {});
  }

  const binaryString = fs.readFileSync(filePath, "utf8");
  const string = binaryToString(binaryString);

  try {
    const data = JSON.parse(string);
    return data;
  } catch (e) {
    console.error("Error decoding binary as JSON:", e);
    return {};
  }
}


// Carrega dinamicamente todos os módulos de rota
function autoLoader(app) {
   // DEFAULT STATIC PUBLIC ITENS
    app.use(express.static(publicItens));
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
  autoLoader
};
