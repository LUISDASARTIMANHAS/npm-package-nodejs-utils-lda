const fs = require("fs");
const {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
} = require("./autoFileSysModule.cjs");
const {
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  reactivateUser,
  ordenarUsuario
} = require("./userSystem.cjs");
const checkHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const sendMail = require("./emailModule.cjs");
const { fetchGet, fetchPost, discordLogs } = require("./fetchModule.cjs");
const httpsSecurityMiddleware = require("./httpsSecurity.cjs");
const {
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  pesqUsuario,
  validadeApiKey,
  unauthorized,
  forbidden,
  formatDate,
  conversorSimEnao,
  spaceUsed,
  notfound,
  sanitize
} = require("./utils.cjs");

// Criando Arquivos pre requisitos
// Verifica se o arquivo config.json existe
if (!fs.existsSync("config.json")) {
  // Se não existir, cria a pasta
  fs.mkdirSync("config.json");
}
// Verifica se o arquivo .env existe
if (!fs.existsSync(".env")) {
  // Se não existir, cria a pasta
  fs.mkdirSync(".env");
}
// Verifica se a pasta ./data existe
if (!fs.existsSync("./data")) {
  // Se não existir, cria a pasta
  fs.mkdirSync("./data");
}

module.exports = {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  checkHeaderMiddleware,
  sendMail,
  fetchGet,
  fetchPost,
  discordLogs,
  httpsSecurityMiddleware,
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  ordenarUsuario,
  pesqUsuario,
  validadeApiKey,
  unauthorized,
  forbidden,
  formatDate,
  conversorSimEnao,
  stringToBinary,
  binaryToString,
  autoLoader,
  spaceUsed,
  notfound,
  sanitize,
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  reactivateUser
};
