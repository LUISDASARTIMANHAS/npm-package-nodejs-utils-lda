const multer = require("multer");
const { createDiskStorage } = require("./diskStorageFactory.cjs");
const { fileTypeValidator } = require("./validators.cjs");
const { uploadLimits } = require("./limits.cjs");
const { default: storageRouter } = require("./storageRoutes.cjs");

/**
 * Upload de páginas
 */
const saveFile = multer({
  storage: createDiskStorage("uploads/pages"),
  limits: {
    fileSize: uploadLimits.maxFileSize,
  },
  fileFilter: fileTypeValidator([
    "text/html",
    "application/pdf",
    "image/png",
    "image/jpeg",
  ]),
});

/**
 * Upload de bots
 */
const saveBot = multer({
  storage: createDiskStorage("uploads/bots"),
  limits: {
    fileSize: uploadLimits.maxFileSize,
  },
  fileFilter: fileTypeValidator([
    "application/zip",
    "application/octet-stream",
  ]),
});

// ROTAS MANAGER, NÃO USAR LOGICA AQUI, APENAS GERENCIAR AS ROTAS E CHAMAR AS FUNÇÕES DE OUTROS ARQUIVOS
// POR EXEMPLO router.use("/api/ENDPOINT",arquivoDeCrudDeRotas);
/**
 * Registra rotas de storage no router principal
 * @param {import("express").Router} router
 * @returns {import("express").Router}
 */
async function apiStorageRoutes(mainRouter) {
  mainRouter.use("/api/storage", storageRouter);

  return mainRouter;
}

module.exports = { saveFile, saveBot, apiStorageRoutes };
