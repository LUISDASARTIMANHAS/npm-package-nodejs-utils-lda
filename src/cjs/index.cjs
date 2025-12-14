const {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
  log,
} = require("./autoFileSysModule.cjs");
const WSChat = require("./WSCHAT/WSChat.cjs");
const {
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  reactivateUser,
  ordenarUsuario,
} = require("./userSystem.cjs");
const { mongoConnect, select, insert } = require("./mongodb.cjs");
const setCacheHeaders = require("./cacheSys.cjs");
const sendFileToDiscord = require("./sendFileToDiscord.cjs");
const checkHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const sendMail = require("./emailModule.cjs");
const {
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
  discordLogs,
} = require("./fetchModule.cjs");
const {
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
} = require("./fetchModuleAsync.cjs");
const httpsSecurityMiddleware = require("./httpsSecurity.cjs");
const {
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  validadeApiKey,
  unauthorized,
  forbidden,
  landingPage,
  formatDate,
  conversorSimEnao,
  spaceUsed,
  notfound,
  sanitize,
  SanitizeXSS,
  serverTry,
  applyAutoMiddlewares,
} = require("./utils.cjs");
const { requestLogger } = require("./requestLogger.cjs");
const { encryptedPayloadMiddleware } = require("./security/encryptedPayload.middleware.cjs");
const { decryptAESGCM, decryptAESKey } = require("./security/crypto.service.cjs");

module.exports = {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  checkHeaderMiddleware,
  sendMail,
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
  discordLogs,
  httpsSecurityMiddleware,
  getRandomInt,
  getRandomBin,
  getRandomHex,
  generateToken,
  validadeApiKey,
  unauthorized,
  forbidden,
  landingPage,
  formatDate,
  conversorSimEnao,
  stringToBinary,
  binaryToString,
  autoLoader,
  spaceUsed,
  notfound,
  sanitize,
  SanitizeXSS,
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  ordenarUsuario,
  reactivateUser,
  mongoConnect,
  select,
  insert,
  serverTry,
  sendFileToDiscord,
  setCacheHeaders,
  log,
  WSChat,
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
  requestLogger,
  applyAutoMiddlewares,
  encryptedPayloadMiddleware,
  decryptAESGCM,
  decryptAESKey
};
// ---------------- FIM DO PATCH AUTOMÁTICO DO EXPRESS ----------------
