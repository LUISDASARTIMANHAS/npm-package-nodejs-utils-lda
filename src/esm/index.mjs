// ----------------------------
// EXPORTAÇÃO AUTOMÁTICA DE MÓDULOS
// ----------------------------

// Discord Utils
export * from "./discordUtils/discordUtils.mjs";

// Interaction Getters
export * from "./discordUtils/interactionGetters.mjs";

// File System
export * from "./autoFileSysModule.mjs";

// Utils
export * from "./utils.mjs";

// User System
export * from "./userSystem.mjs";

// Fetch Modules
export * from "./fetchModule.mjs";
export * from "./fetchModuleAsync.mjs";

// Security system
export * from "./security/crypto.service.mjs";
export * from "./security/encryptedPayload.middleware.mjs";

// Storage
export * from "./storage/index.mjs";

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