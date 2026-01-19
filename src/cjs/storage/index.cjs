const multer = require("multer");
const { createDiskStorage } = require("./diskStorageFactory");
const { fileTypeValidator } = require("./validators");
const { uploadLimits } = require("./limits");

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

module.exports = { saveFile, saveBot };
