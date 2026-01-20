// ----------------------------
// IMPORTS
// ----------------------------

const {
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
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

const {
  encryptedPayloadMiddleware,
} = require("./security/encryptedPayload.middleware.cjs");

const {
  decryptAESGCM,
  decryptAESKey,
} = require("./security/crypto.service.cjs");

const { saveFile, saveBot } = require("./storage/index.cjs");

// logger
const { log } = require("./logger/index.cjs");

// auth
const { requestAuthCode } = require("./auth/auth.service.cjs");
const {verifyAuthCode} = require("./auth/auth.verify.cjs");
const { saveOTP, getOTP, deleteOTP } = require("./auth/otp.store.cjs");

// ----------------------------
// EXPORTS (API PÚBLICA)
// ----------------------------

module.exports = {
  // File system
  fopen,
  fwrite,
  freadBin,
  fwriteBin,
  stringToBinary,
  binaryToString,
  autoLoader,
  log,

  // Middlewares
  checkHeaderMiddleware,
  httpsSecurityMiddleware,
  encryptedPayloadMiddleware,
  setCacheHeaders,
  requestLogger,

  // Security / crypto
  decryptAESGCM,
  decryptAESKey,

  // Fetch
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
  discordLogs,

  // Utils
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

  // User system
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  reactivateUser,
  ordenarUsuario,

  // MongoDB
  mongoConnect,
  select,
  insert,

  // storage
  saveFile,
  saveBot,

  // Auth
  requestAuthCode,
  saveOTP,
  getOTP,
  deleteOTP,

  // Misc
  sendFileToDiscord,
  sendMail,
  WSChat,
};

// ----------------------------
// BLOQUEIO DE DEFAULT IMPORT (ESM → CJS)
// ----------------------------

Object.defineProperty(module.exports, "default", {
  enumerable: false,
  configurable: false,
  get() {
    throw new Error(
      "[npm-package-nodejs-utils-lda] Importação incorreta detectada.\n" +
        "Você está usando default import em um módulo CommonJS.\n\n" +
        "Use sempre:\n" +
        "  import { modulo } from 'npm-package-nodejs-utils-lda'\n" +
        "ou no CommonJS:\n" +
        "  const { modulo } = require('npm-package-nodejs-utils-lda')",
    );
  },
});

// ----------------------------
// FIM DO INDEX.CJS
// ----------------------------
