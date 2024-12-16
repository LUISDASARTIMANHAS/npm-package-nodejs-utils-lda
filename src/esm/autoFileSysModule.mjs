import { readFileSync, writeFileSync } from "fs";
const routesDir = __dirname;
const rootDir = process.cwd();

function fopen(filePath) {
  const database = readFileSync(filePath, "utf8");
  const data = JSON.parse(database);

  return data;
}

function fwrite(filePath, data) {
  const formatData = JSON.stringify(data, null, 2);

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

export default {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
};
