import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtém o caminho absoluto do arquivo atual
const __filename = fileURLToPath(import.meta.url);

const routesDir = dirname(__filename);
const rootDir = process.cwd();

function fopen(filePath) {
  if (!existsSync(filePath)) {
    // Se for JSON, cria com objeto vazio; se for .txt, cria como string vazia
    console.error(`File not found. Creating new file: ${filePath}`);
    const defaultValue = filePath.endsWith(".json") ? {} : "";
    fwrite(filePath, defaultValue);
  }

  const content = readFileSync(filePath, "utf8");

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

  writeFileSync(filePath, formatData, "utf8");
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

  writeFileSync(filePath, binaryString, "utf8");
  return true;
}

// Leitura e conversão de volta para JSON
function freadBin(filePath) {
  if (!existsSync(filePath)) {
    // cria arquivo binário vazio com "{}" por padrão
    console.error(`File not found. Creating new file: ${filePath}`);
    fwriteBin(filePath, {});
  }

  const binaryString = readFileSync(filePath, "utf8");
  const string = binaryToString(binaryString);

  try {
    const data = JSON.parse(string);
    return data;
  } catch (e) {
    console.error("Error decoding binary as JSON:", e);
    return {};
  }
}


export {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
};
