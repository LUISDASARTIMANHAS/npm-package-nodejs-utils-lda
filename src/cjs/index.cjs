const {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
} = require("./autoFileSysModule.cjs");
const checkHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const sendMail = require("./emailModule.cjs");
const { fetchGet, fetchPost, discordLogs } = require("./fetchModule.cjs");
const httpsSecurityMiddleware = require("./httpsSecurity.cjs");
const {
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
  spaceUsed,
  notfound,
  sanitize
} = require("./utils.cjs");

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
  sanitize
};
