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
