// src\esm\storage\index.mjs
import storageRouter from "./storageRoutes.mjs";
import multer from "multer";
import { createDiskStorage } from "./diskStorageFactory.mjs";
import { fileTypeValidator } from "./validators.mjs";
import { uploadLimits } from "./limits.mjs";

/**
 * Upload de páginas
 */
export const saveFile = multer({
  storage: createDiskStorage("uploads/pages", false),
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
export const saveBot = multer({
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
export async function apiStorageRoutes(mainRouter) {

  mainRouter.use("/api/storage", storageRouter);

  return mainRouter;
}
