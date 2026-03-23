// ----------------------------
// IMPORTS
// ----------------------------
const figlet = require("figlet");
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

const { logsDashboard, StatusDashboard, checkHeaderMiddleware } = require("./router/router.cjs");

const setCacheHeaders = require("./router/cacheSys.cjs");
const sendFileToDiscord = require("./sendFileToDiscord.cjs");
const checkHeaderMiddleware = require("./checkHeaderMiddleware.cjs");
const sendMail = require("./emailModule.cjs");

const discordLogs = require("./discordUtils/discordSender.cjs");

const {
  fetchGet,
  fetchDownloadStream,
  fetchPost,
  fetchPostJson,
} = require("./fetchUtils/fetchModule.cjs");

const {
  fetchDownloadStreamAsync,
  fetchGetAsync,
  fetchPostAsync,
  fetchPostJsonAsync,
} = require("./fetchUtils/fetchModuleAsync.cjs");

const httpsSecurityMiddleware = require("./httpsSecurity.cjs");

const {
  configExist,
  getConfig,
  saveConfig,
  checkConfigValue,
} = require("./configHelper.cjs");

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
  sanitizeNetworkInterfaces,
  exposeFolders,
  exposePublicFolder,
  exposeLogsFolder,
  fileExistAndCreate,
  shell,
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
const { verifyAuthCode } = require("./auth/auth.verify.cjs");
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
  httpsSecurityMiddleware,
  encryptedPayloadMiddleware,
  setCacheHeaders,
  requestLogger,

   // router
  checkHeaderMiddleware,
  logsDashboard,
  StatusDashboard,

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
  
  // CONFIG HELPER
  configExist,
  getConfig,
  saveConfig,
  checkConfigValue,

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
  sanitizeNetworkInterfaces,
  exposeFolders,
  exposePublicFolder,
  exposeLogsFolder,
  fileExistAndCreate,
  shell,

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
  verifyAuthCode,

  // Misc
  sendFileToDiscord,
  sendMail,
  WSChat,
};


console.log(
  figlet.textSync("UTILS LDA", {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default",
  })
);

console.log("[npm-package-nodejs-utils-lda] CommonJS  loaded 🚀");

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
