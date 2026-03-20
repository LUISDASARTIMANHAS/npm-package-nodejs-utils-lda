// ----------------------------
// EXPORTAÇÃO AUTOMÁTICA DE MÓDULOS
// ----------------------------
const figlet = require("figlet");

// Discord Utils
export * from "./discordUtils/discordEmbed.mjs"
export * from "./discordUtils/discordSender.mjs"
export * from "./discordUtils/interactionGetters.mjs"
export * from "./discordUtils/discordUtils.mjs";
export * from "./discordUtils/permissionValidators.mjs"
export * from "./discordUtils/moderation.mjs"
export * from "./discordUtils/defaultCommands/implementsCommands.mjs"

// Interaction Getters
export * from "./discordUtils/interactionGetters.mjs";

// File System
export * from "./autoFileSysModule.mjs";

// Utils
export * from "./utils.mjs";

// User System
export * from "./userSystem.mjs";

// Fetch Modules
export * from "./fetchUtils/fetchModule.mjs";
export * from "./fetchUtils/fetchModuleAsync.mjs";

// Security system
export * from "./security/crypto.service.mjs";
export * from "./security/encryptedPayload.middleware.mjs";

// Storage
export * from "./storage/index.mjs";

// logger
export * from "./logger/index.mjs";

// auth
export { requestAuthCode } from "./auth/auth.service.mjs";
export { verifyAuthCode } from "./auth/auth.verify.mjs";
export * from "./auth/otp.store.mjs";
// ----------------------------
// EXPORTAÇÃO DE MÓDULOS ÚNICOS
// ----------------------------
export { default as WSChat } from "./WSCHAT/WSChat.mjs";
export { mongoConnect, select, insert } from "./mongodb.mjs";
export { default as checkHeaderMiddleware } from "./checkHeaderMiddleware.mjs";
export { default as setCacheHeaders } from "./cacheSys.mjs";
export { default as httpsSecurityMiddleware } from "./httpsSecurity.mjs";
export { default as sendFileToDiscord } from "./sendFileToDiscord.mjs";
export { default as sendMail } from "./emailModule.mjs";
export { requestLogger } from "./requestLogger.mjs";

console.log(
  figlet.textSync("UTILS LDA", {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default",
  })
);

console.log("[npm-package-nodejs-utils-lda] loaded 🚀");

// ----------------------------
// BLOQUEIO DE DEFAULT IMPORT
// ----------------------------
const __INVALID_DEFAULT_IMPORT__ = new Proxy({}, {
  get() {
    throw new Error(
      "[npm-package-nodejs-utils-lda] Importação incorreta. " +
      "Use sempre named imports: import { modulo } from 'npm-package-nodejs-utils-lda'."
    );
  }
});

export default __INVALID_DEFAULT_IMPORT__;