// ----------------------------
// IMPORTS
// ----------------------------
const figlet = require("figlet");

const WSChat = require("./WSCHAT/WSChat.cjs");

const sendFileToDiscord = require("./sendFileToDiscord.cjs");
const sendMail = require("./emailModule.cjs");

const {
  encryptedPayloadMiddleware,
} = require("./security/encryptedPayload.middleware.cjs");

const antiReplyMiddleware = require("./security/antiReplay.cjs");

const { saveFile, saveBot } = require("./storage/index.cjs");

// logger
const { log } = require("./logger/index.cjs");

// ----------------------------
// EXPORTS (API PÚBLICA)
// ----------------------------

module.exports = {
  // File system
  ...require("./autoFileSysModule.cjs"),

  // Middlewares
  encryptedPayloadMiddleware,

  // router
  ...require("./router/router.cjs"),

  // API EXCEPTIONS
  ...require("./router/exceptionAPI.cjs"),

  // Security / crypto
  ...require("./security/crypto.service.cjs"),

  // Fetch
  ...require("./fetchUtils/fetchModule.cjs"),
  ...require("./fetchUtils/fetchModuleAsync.cjs"),

  // CONFIG HELPER
  ...require("./configHelper.cjs"),

  // Utils
  ...require("./utils.cjs"),

  // User system
  ...require("./userSystem/index.cjs"),

  // MongoDB
  ...require("./mongodb.cjs"),

  // storage
  saveFile,
  saveBot,

  // Auth
  ...require("./auth/auth.service.cjs"),
  ...require("./auth/auth.verify.cjs"),
  ...require("./auth/otp.store.cjs"),

  // Misc
  sendFileToDiscord,
  sendMail,
  WSChat,
  ...require("./discordUtils/discordSender.cjs"),
};

console.log(
  figlet.textSync("UTILS LDA", {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default",
  }),
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
